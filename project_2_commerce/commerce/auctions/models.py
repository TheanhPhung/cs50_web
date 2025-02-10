from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    def __str__(self):
        return self.username


class Category(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class Listing(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="auction_listings")
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    starting_bid = models.FloatField()
    image_url = models.URLField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, blank=True, null=True, related_name="listings_by_category")
    is_active = models.BooleanField(default=True)
    interested_by = models.ManyToManyField(User, related_name="watchlist")

    def __str__(self):
        return self.title

    def current_price(self):
        if self.bids.last():
            return self.bids.last().price

        return self.starting_bid


class Bid(models.Model):
    bid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_bids")
    bid_for = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")
    price = models.FloatField()


class Comment(models.Model):
    pass
