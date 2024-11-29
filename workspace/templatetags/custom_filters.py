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
        "red-500", "blue-500", "green-500", "yellow-500",
        "purple-500", "pink-500", "gray-500", "indigo-500"
    ]
    return random.choice(colors)


@register.filter
def random_tailwind_text_color(value):
    text_colors = [
        "text-red-500", "text-blue-500", "text-green-500", "text-yellow-500",
        "text-purple-500", "text-pink-500", "text-gray-500", "text-indigo-500"
    ]
    return random.choice(text_colors)