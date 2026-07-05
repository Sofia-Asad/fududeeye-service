def serialize_audit_logs(logs):
    """Shared AuditLog -> dict shape used by the reports audit log endpoint
    and the per-object `history` actions on individual viewsets."""
    return [
        {
            'id': log.pk,
            'timestamp': log.timestamp.isoformat(),
            'user': log.user.username if log.user else None,
            'action': log.action,
            'model_name': log.model_name,
            'object_id': log.object_id,
            'object_repr': log.object_repr,
            'changes': log.changes,
            'ip_address': log.ip_address,
        }
        for log in logs
    ]
