from django.contrib.auth.models import AbstractUser
from django.db import models

from django.utils import timezone


class User(AbstractUser):
    follow = models.ManyToManyField('self', symmetrical=False, related_name="followers")

    def liked_posts(self):
        liked_list = self.likes.all()
        posts = []
        for like in liked_list:
            posts.append(like.post.id)
        return posts


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def get_owner_name(self):
        return self.owner.username

    def like_count(self):
        return self.likes.count()

    def comment_count(self):
        return self.comments.count()

    def edited_content(self):
        if self.edited_posts.last():
            edited_post = self.edited_posts.last()
            return edited_post.new_content
        return None

    def updated_at(self):
        if self.edited_posts.last():
            edited_post = self.edited_posts.last()
            return edited_post.updated_at
        return None


class EditedPost(models.Model):
    origin = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="edited_posts")
    new_content = models.TextField()
    updated_at = models.DateTimeField(auto_now_add=True)


class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    liked_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    commented_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-commented_at"]

    def commenter_name(self):
        return self.commenter.username
