from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follow = models.ManyToManyField("self", symmetrical=False, related_name="followers")

    def follower_count(self):
        return self.followers.count()


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def owner_name(self):
        return self.owner.username

    def like_count(self):
        return self.likes.count()

    def comment_count(self):
        return self.comments.count()


class EditedPost(models.Model):
    origin = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="edited_posts")
    new_content = models.TextField()
    updated_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    created_at = models.DateTimeField(auto_now_add=True)

    def commenter_name(self):
        return self.commenter.username


class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")


class EditedPost(models.Model):
    origin = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="edited_posts")
    new_content = models.TextField()
    edited_at = models.DateTimeField(auto_now_add=True)
