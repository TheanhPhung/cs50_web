
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("me/", views.me, name="me"),
    path("posts/", views.PostList.as_view(), name="posts-list"),
    path("posts/user=<int:user_id>/", views.PostList.as_view()),
    path("posts/<int:pk>/", views.PostDetail.as_view(), name="post-detail"),
    path("editpost/", views.EditedPostList.as_view(), name="edited-posts-list"),
    path("edited-post/<int:post_id>/", views.EditedPostCustomList.as_view(), name="edited-post-custom-list"),
    path("users/", views.UserList.as_view(), name="users-list"),
    path("users/<int:pk>/", views.UserDetail.as_view(), name="user-detail"),
    path("likes/", views.LikeList.as_view(), name="likes-list"),
    path("likes/<int:pk>/", views.LikeDetail.as_view(), name="like-detail"),
    path("comments/<int:post_id>/", views.CommentList.as_view(), name="comments-list"),
    path("get-like/user=<int:user_id>/post=<int:post_id>/", views.get_like_id, name="get-like"),
]
