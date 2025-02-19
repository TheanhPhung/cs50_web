from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import *
from .serializers import *


def index(request):
    return render(request, "network/index.html")


class PostList(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self, *args, **kwargs):
        if (self.kwargs.get("user_id")):
            user_id = self.kwargs.get("user_id")
            user = User.objects.get(pk=user_id)
            return Post.objects.filter(owner=user)
        else:
            return Post.objects.all()


class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class EditedPostList(generics.ListCreateAPIView):
    queryset = EditedPost.objects.all()
    serializer_class = EditedPostSerializer


class EditedPostCustomList(generics.ListCreateAPIView):
    serializer_class = EditedPostSerializer

    def get_queryset(self):
        post_id = self.kwargs.get("post_id")
        post = Post.objects.get(pk=post_id)
        return post.edited_posts.last()


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class LikeList(generics.ListCreateAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer


class LikeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer


class CommentList(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs.get("post_id")
        post = Post.objects.get(pk=post_id)
        return Comment.objects.filter(post=post)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@api_view(["GET"])
def me(request):
    return Response({"id": request.user.id, "username": request.user.username})


@api_view(["GET"])
def get_like_id(request, user_id, post_id):
    user = User.objects.get(pk=user_id)
    post = Post.objects.get(pk=post_id)
    like = Like.objects.get(liker=user, post=post)
    return Response({"id": like.id})
