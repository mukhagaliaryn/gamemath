from django import template
import random

register = template.Library()

@register.filter
def get(dictionary, key):
    return dictionary.get(key)


@register.filter
def first_upper(value):
    if not isinstance(value, str) or not value:
        return ''
    return value[0].upper()


@register.filter
def random_tailwind_color(value):
    colors = [
        "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
        "bg-purple-500", "bg-pink-500", "bg-gray-500", "bg-indigo-500"
    ]
    return random.choice(colors)


@register.filter
def random_tailwind_text_color(value):
    text_colors = [
        "text-red-500", "text-blue-500", "text-green-500", "text-yellow-500",
        "text-purple-500", "text-pink-500", "text-gray-500", "text-indigo-500"
    ]
    return random.choice(text_colors)