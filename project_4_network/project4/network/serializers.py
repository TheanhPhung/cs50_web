from rest_framework import serializers

from .models import User, Post, Like, Comment


class PostSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "owner", "owner_name", "content", "created_at"]

    def get_owner_name(self, obj):
        return obj.get_owner_name()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
