from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.views.generic import ListView

from .models import User, Category, Listing, Bid, Comment


class ListingListView(ListView):
    model = Listing

    def get_content_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["listing"] = Listing.objects.filter(is_active=True)
        return context


def index(request):
    listings = Listing.objects.filter(is_active=True) 
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

    if request.user.is_authenticated:
        watchlist_check = (listing in request.user.watchlist.all())
    else:
        watchlist_check = False

    count_bids = Bid.objects.filter(bid_for=listing).count()

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "watchlist_check": watchlist_check,
        "count_bids": count_bids
    })


def watchlist(request):
    if request.user.is_authenticated:
        listings = request.user.watchlist.all()

        return render(request, "auctions/index.html", {
            "listings": listings,
            "header": "Watchlist"
        })

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))


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

        pass

    messages.error(request, "You must be logged in to performed this function.")
    return HttpResponseRedirect(reverse("login"))
