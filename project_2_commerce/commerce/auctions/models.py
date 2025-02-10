from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="auction_listings")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    starting_bid = models.FloatField()
    image_url = models.URLField()

    def __str__(self):
        return self.title


class Bid(models.Model):
    pass


class Comment(models.Model):
    pass


class Category(models.Model):
    name = models.CharField(max_length=64)
