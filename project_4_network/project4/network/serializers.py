from rest_framework import serializers

from .models import *


class UserSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "follow", "follower_count"]

    def follower_count(self, obj):
        return obj.follower_count()


class PostSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "owner", "content", "created_at", "owner_name", "like_count", "comment_count"]

    def owner_name(self, obj):
        return obj.owner_name()

    def like_count(self, obj):
        return obj.like_count()

    def comment_count(self, obj):
        return obj.comment_count()


class EditedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditedPost
        fields = "__all__"


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"
