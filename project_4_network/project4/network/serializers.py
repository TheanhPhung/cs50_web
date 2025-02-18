from rest_framework import serializers

from .models import User, Post, Like, Comment


class PostSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "owner", "owner_name", "content", "created_at", "like_count", "comment_count"]

    def get_owner_name(self, obj):
        return obj.get_owner_name()

    def like_count(self, obj):
        return obj.like_count()

    def comment_count(self, obj):
        return obj.comment_count()

class UserSerializer(serializers.ModelSerializer):
    liked_posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "follow", "liked_posts"]

    def liked_posts(self, obj):
        return obj.liked_posts()


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"
