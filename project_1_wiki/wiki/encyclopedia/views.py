# import markdown2
from random import choice

from django.shortcuts import render, redirect
from django.http import Http404, HttpResponse
from django.contrib import messages

from .form import PageForm
from . import util, convert


def index(request):
    entries = util.list_entries()
    if len(entries) == 0:
        messages.error(request, "No entry available")

    return render(request, "encyclopedia/index.html", {
        "entries": entries 
    })


def detail(request, title):
    if util.get_title(title):
        title = util.get_title(title)
        # content = markdown2.Markdown().convert(util.get_entry(title))
        content = convert.convert(title)

        return render(request, "encyclopedia/detail.html", {
            "title": title,
            "content": content
        })

    messages.error(request, "404 Error. Page Not Found!")
    return redirect("index")


def search(request):
    q = request.GET["q"]
    search_result = []

    for entry in util.list_entries():
        if q.lower() in entry.lower():
            search_result.append(entry)

    if len(search_result) == 0:
        messages.error(request, "The query does not match any encyclopedia entry.")

    return render(request, "encyclopedia/index.html", {
        "entries": search_result
    })


def create(request):
    if request.method == "POST":
        form = PageForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]

            if util.get_title(title):
                messages.error(request, "422 Error. The provided title already exists!")
                return redirect("index")

            util.save_entry(title, content)
            return redirect("detail", title=title)

    else:
        form = PageForm()
        return render(request, "encyclopedia/create.html", {
            "form": form
        })


def edit(request, title):
    if request.method == "POST":
        content = request.POST["content"]
        if not content:
            messages.error(request, "Edit failed. Must fill in the \"Content\" field!")
            return redirect("index")

        util.save_entry(title, content)
        return redirect("detail", title=title)

    else:
        title = util.get_title(title)
        content = util.get_entry(title)
        print(content)

        return render(request, "encyclopedia/edit.html", {
            "title": title,
            "content": content
        })


def random(request):
    title = choice(util.list_entries())
    return redirect("detail", title=title)
