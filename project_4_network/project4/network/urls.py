
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts/", views.PostList.as_view()),
    path("posts/filter=<str:filter>/", views.PostList.as_view()),
    path("test", views.test),
]
