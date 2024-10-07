from django import template

register = template.Library()

@register.filter
def get_video_item(queryset, video_id):
    try:
        return queryset.get(video__id=video_id)
    except queryset.model.DoesNotExist:
        return None


@register.filter
def get_test_item(queryset, test_id):
    try:
        return queryset.get(test__id=test_id)
    except queryset.model.DoesNotExist:
        return None


@register.filter
def get_task_item(queryset, task_id):
    try:
        return queryset.get(task__id=task_id)
    except queryset.model.DoesNotExist:
        return None