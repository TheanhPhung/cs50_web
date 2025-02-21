
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts/", views.PostList.as_view()),
    path("posts/filter=<str:filter>/", views.PostList.as_view()),
    path("edited-posts/", views.EditedPostList.as_view()),
    path("edit-post/<int:post_id>/", views.EditedPostList.as_view()),
    path("likes/", views.LikeList.as_view()),
    path("likes/post=<int:post_id>/", views.LikeList.as_view()),
    path("likes/filter=<str:filter>/user=<user_id>/post=<int:post_id>/", views.LikeList.as_view()),
    path("likes/<int:pk>/", views.LikeDetail.as_view()),
    path("me/", views.me),
]
