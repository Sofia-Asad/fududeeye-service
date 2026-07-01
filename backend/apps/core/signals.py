from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver

from .models import AuditedModel, AuditLog
from .middleware import get_current_user, get_current_ip

_pre_save_state = {}


@receiver(pre_save)
def _capture_pre_save(sender, instance, **kwargs):
    if not isinstance(instance, AuditedModel) or not instance.pk:
        return
    try:
        _pre_save_state[id(instance)] = {
            f.name: str(getattr(instance, f.name))
            for f in instance._meta.fields
            if f.name not in ('created_by', 'updated_by', 'created_at', 'updated_at')
        }
    except Exception:
        pass


@receiver(post_save)
def _handle_post_save(sender, instance, created, **kwargs):
    if not isinstance(instance, AuditedModel):
        return

    user = get_current_user()
    authenticated = user is not None and getattr(user, 'is_authenticated', False)

    # Fill created_by / updated_by via queryset update to avoid re-triggering signals
    if created and authenticated and not instance.created_by_id:
        sender.objects.filter(pk=instance.pk).update(created_by=user)
    if authenticated:
        sender.objects.filter(pk=instance.pk).update(updated_by=user)

    old_state = _pre_save_state.pop(id(instance), {})
    if not created and old_state:
        new_state = {
            f.name: str(getattr(instance, f.name))
            for f in instance._meta.fields
            if f.name not in ('created_by', 'updated_by', 'created_at', 'updated_at')
        }
        changes = {
            k: {'old': old_state[k], 'new': new_state[k]}
            for k in old_state
            if old_state[k] != new_state.get(k)
        }
    else:
        changes = {}

    AuditLog.objects.create(
        user=user if authenticated else None,
        action=AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes=changes,
        ip_address=get_current_ip(),
    )


@receiver(post_delete)
def _handle_post_delete(sender, instance, **kwargs):
    if not isinstance(instance, AuditedModel):
        return

    user = get_current_user()
    authenticated = user is not None and getattr(user, 'is_authenticated', False)

    AuditLog.objects.create(
        user=user if authenticated else None,
        action=AuditLog.Action.DELETE,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance),
        changes={},
        ip_address=get_current_ip(),
    )
