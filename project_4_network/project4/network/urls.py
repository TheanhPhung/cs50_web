
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("me/", views.me, name="me"),
    path("posts/", views.PostList.as_view(), name="posts-list"),
    path("users/", views.UserList.as_view(), name="users-list"),
    path("users/<int:pk>/", views.UserDetail.as_view(), name="user-detail"),
]
