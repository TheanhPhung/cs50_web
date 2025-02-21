from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import User
from .serializers import *
from .paginations import CustomPagination


class PostList(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    pagination_class = CustomPagination

    def get_queryset(self, *args, **kwargs):
        filter_value = self.kwargs.get("filter")
        if filter_value:
            if filter_value == "last":
                return Post.objects.all()[:1]
        else:
            return Post.objects.all()


class EditedPostList(generics.ListCreateAPIView):
    serializer_class = EditedPostSerializer

    def get_queryset(self, *args, **kwargs):
        post_id = self.kwargs.get("post_id")
        if post_id:
            post = Post.objects.get(pk=post_id)
            return EditedPost.objects.filter(origin=post).order_by("-id")[:1]
        else:
            return EditedPost.objects.all().order_by("-id")


class LikeList(generics.ListCreateAPIView):
    serializer_class = LikeSerializer

    def get_queryset(self, *args, **kwargs):
        post_id = self.kwargs.get("post_id")
        user_id = self.kwargs.get("user_id")
        filter_value = self.kwargs.get("filter")
        if filter_value == "check":
            user = User.objects.get(pk=user_id)
            post = Post.objects.get(pk=post_id)
            return Like.objects.filter(liker=user, post=post)
        elif post_id:
            post = Post.objects.get(pk=post_id)
            return Like.objects.filter(post=post)
        else:
            return Like.objects.all()


class LikeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer


def index(request):
    return render(request, "network/index.html")


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
