from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.detail, name="detail"),
    path("wiki/error/page_not_found", views.error_page, name="error-page")
]
