import markdown2

from django.shortcuts import render, redirect
from django.http import Http404

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def detail(request, title):
    content = title.lower()
    content = util.get_entry(title.title())
    if not content:
        content = util.get_entry(title.upper())

    if not content:
        return redirect("error-page")

    content = markdown2.Markdown().convert(content)
    status_code = 200

    return render(request, "encyclopedia/detail.html", {
        "content": content,
        "title": title
    }, status=status_code) 


def error_page(request):
    return render(request, "encyclopedia/detail.html", {
        "content": "<h1 class=\"mt-1\">Error</h2><strong>404. Page Not Found!</strong>",
        "title": "Error - Page Not Found"
    }, status=404)
