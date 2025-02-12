from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("listing/<int:listing_id>", views.listing, name="listing"),
    path("create_listing", views.create_listing, name="create-listing"),
    path("edit_watchlist/<int:listing_id>", views.edit_watchlist, name="edit-watchlist"),
    path("bid/<int:listing_id>", views.place_bid, name="place-bid"),
    path("close/<int:listing_id>", views.close_auction, name="close-auction"),
    path("user/<int:user_id>", views.user_listing, name="user-listing"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("categories", views.categories, name="categories"),
    path("category/<str:category_name>", views.category, name="category"),
    path("comment/<int:listing_id>", views.comment, name="comment"),
]
