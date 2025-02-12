from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Category, Listing, Bid, Comment


def index(request):
    listings = Listing.objects.filter(is_active=True).order_by("-created_at")
    return render(request, "auctions/index.html", {
        "listings": listings
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def listing(request, listing_id):
    listing = Listing.objects.get(pk=listing_id)

    if request.user == listing.winner:
        messages.success(request, "Congratulations! You've won this auction.")

    if request.user.is_authenticated:
        watchlist_check = (listing in request.user.watchlist.all())
    else:
        watchlist_check = False

    count_bids = Bid.objects.filter(bid_for=listing).count()

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "watchlist_check": watchlist_check,
        "count_bids": count_bids,
        "comments": listing.comments.all().order_by("-created_at")
    })


def user_listing(request, user_id):
    user = User.objects.get(pk=user_id)
    listings = Listing.objects.filter(owner=user).order_by("-created_at")

    return render(request, "auctions/index.html", {
        "listings": listings,
        "header": f"{user.username}'s listings"
    })


def watchlist(request):
    if request.user.is_authenticated:
        listings = request.user.watchlist.all().order_by("-created_at")

        return render(request, "auctions/index.html", {
            "listings": listings,
            "header": "Watchlist"
        })

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))


def categories(request):
    return render(request, "auctions/categories.html", {
        "categories": Category.objects.all()
    })


def category(request, category_name):
    category = Category.objects.get(name=category_name)
    listings = Listing.objects.filter(category=category).order_by("-created_at")
    return render(request, "auctions/index.html", {
        "listings": listings,
        "header": f"{category.name}'s Listings"
    })


@login_required
def create_listing(request):
    if request.method == "POST":
        title = request.POST["title"]
        description = request.POST["description"]
        image_url = request.POST["image_url"]
        starting_bid = request.POST["starting_bid"]

        if request.POST["category"]:
            category = Category.objects.get(pk=request.POST["category"])
        else:
            category = None

        Listing.objects.create(owner=request.user,
                               title=title,
                               description=description,
                               image_url=image_url,
                               starting_bid=starting_bid,
                               category=category)

        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "auctions/create_listing.html", {
            "category_list": Category.objects.all()
        })


def edit_watchlist(request, listing_id):
    if request.user.is_authenticated:
        listing = Listing.objects.get(pk=listing_id)
        if listing in request.user.watchlist.all():
            request.user.watchlist.remove(listing)
        else:
            request.user.watchlist.add(listing)

        return HttpResponseRedirect(reverse("watchlist"))

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))


def place_bid(request, listing_id):
    if request.user.is_authenticated:
        listing = Listing.objects.get(pk=listing_id)
        price = request.POST["price"]

        if float(price) <= listing.current_price():
            messages.error(request, "The bid must be as large as the starting bid, and must be greater than any other bids that have been place.")

        else:
            bid = Bid.objects.create(bid_by=request.user,
                                     bid_for=listing,
                                     price=price)
            messages.info(request, "Bid successfully")

        return HttpResponseRedirect(reverse("listing", args=(listing.id,)))

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))


@login_required
def close_auction(request, listing_id):
    listing = Listing.objects.get(pk=listing_id)

    if listing.owner == request.user:
        listing.is_active = False
        if listing.bids.count() == 0:
            messages.info(request, f"'{listing.title}' was closed by {listing.owner.username}.")
        else:
            bid = listing.bids.last()
            listing.winner = bid.bid_by
            messages.success(request, f"'{listing.title}' auction was closed by {listing.owner.username}. {bid.bid_by} won the auction with a bid of ${bid.price}.")

        listing.save()

        return HttpResponseRedirect(reverse("listing", args=(listing.id,)))


def comment(request, listing_id):
    if request.user.is_authenticated:
        content = request.POST["content"]
        listing = Listing.objects.get(pk=listing_id)
        comment = Comment.objects.create(owner=request.user,
                                 content=content,
                                 comment_on=listing)

        return HttpResponseRedirect(reverse("listing", args=(listing.id,)))

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))
