from rest_framework import serializers

from .models import *

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
