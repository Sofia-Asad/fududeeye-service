from django.db.models.signals import post_save, post_delete, pre_save
from django.contrib.auth import get_user_model
from django.dispatch import receiver

from .models import AuditedModel, AuditLog
from .middleware import get_current_user, get_current_ip

_pre_save_state = {}
AUDITED_FIELD_EXCLUDES = ('created_by', 'updated_by', 'created_at', 'updated_at')
USER_AUDIT_EXCLUDES = ('password', 'last_login')


def _is_user_instance(instance):
    return isinstance(instance, get_user_model())


def _field_state(instance, excluded_fields):
    return {
        f.name: str(getattr(instance, f.name))
        for f in instance._meta.fields
        if f.name not in excluded_fields
    }


def _current_actor():
    user = get_current_user()
    authenticated = user is not None and getattr(user, 'is_authenticated', False)
    return user if authenticated else None


def _changes_for(instance, excluded_fields):
    old_state = _pre_save_state.pop(id(instance), {})
    if not old_state:
        return {}

    new_state = _field_state(instance, excluded_fields)
    return {
        k: {'old': old_state[k], 'new': new_state[k]}
        for k in old_state
        if old_state[k] != new_state.get(k)
    }


def _write_audit_log(instance, action, actor, changes=None):
    AuditLog.objects.create(
        user=actor,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes=changes or {},
        ip_address=get_current_ip(),
    )


@receiver(pre_save)
def _capture_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        return

    if isinstance(instance, AuditedModel):
        excluded_fields = AUDITED_FIELD_EXCLUDES
    elif _is_user_instance(instance):
        excluded_fields = USER_AUDIT_EXCLUDES
    else:
        return

    try:
        previous = sender.objects.get(pk=instance.pk)
        _pre_save_state[id(instance)] = _field_state(previous, excluded_fields)
    except sender.DoesNotExist:
        pass
    except Exception:
        pass


@receiver(post_save)
def _handle_post_save(sender, instance, created, **kwargs):
    if _is_user_instance(instance):
        actor = _current_actor()
        changes = {} if created else _changes_for(instance, USER_AUDIT_EXCLUDES)
        if not created and not changes:
            return
        _write_audit_log(
            instance=instance,
            action=AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE,
            actor=actor,
            changes=changes,
        )
        return

    if not isinstance(instance, AuditedModel):
        return

    actor = _current_actor()

    # Fill created_by / updated_by via queryset update to avoid re-triggering signals
    if created and actor and not instance.created_by_id:
        sender.objects.filter(pk=instance.pk).update(created_by=actor)
    if actor:
        sender.objects.filter(pk=instance.pk).update(updated_by=actor)

    _write_audit_log(
        instance=instance,
        action=AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE,
        actor=actor,
        changes={} if created else _changes_for(instance, AUDITED_FIELD_EXCLUDES),
    )


@receiver(post_delete)
def _handle_post_delete(sender, instance, **kwargs):
    actor = _current_actor()

    if _is_user_instance(instance):
        if actor and actor.pk == instance.pk:
            actor = None
        _write_audit_log(
            instance=instance,
            action=AuditLog.Action.DELETE,
            actor=actor,
        )
        return

    if not isinstance(instance, AuditedModel):
        return

    _write_audit_log(
        instance=instance,
        action=AuditLog.Action.DELETE,
        actor=actor,
    )
