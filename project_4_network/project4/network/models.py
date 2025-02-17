from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follow = models.ManyToManyField('self', symmetrical=False, related_name="followers")


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def get_owner_name(self):
        return self.owner.username


class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="interest_posts")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    liked_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="commented_posts")
    commented_at = models.DateTimeField(auto_now_add=True)
