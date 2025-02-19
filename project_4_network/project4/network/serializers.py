from rest_framework import serializers

from .models import * 


class PostSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    edited_content = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "owner", "owner_name", "content", "created_at", "like_count", "comment_count", "edited_content", "updated_at"]

    def get_owner_name(self, obj):
        return obj.get_owner_name()

    def like_count(self, obj):
        return obj.like_count()

    def comment_count(self, obj):
        return obj.comment_count()

    def edited_content(self, obj):
        return obj.edited_content()

    def updated_at(self, obj):
        return obj.updated_at()


class EditedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditedPost
        fields = "__all__"


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
    commenter_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "commenter", "post", "content", "commented_at", "commenter_name"]

    def commenter_name(self, obj):
        return obj.commenter_name()
