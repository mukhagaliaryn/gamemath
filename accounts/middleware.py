from django.shortcuts import redirect
from django.urls import reverse


class BlockAuthenticatedMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.path in [reverse('login'), reverse('signup')]:
            return redirect('home')

        response = self.get_response(request)
        return response
