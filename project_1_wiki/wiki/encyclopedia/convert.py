import re

from . import util


def convert(title):
    content = util.get_entry(title)
    content = convert_heading(content)
    content = convert_bold_style(content)
    content = convert_unordered_list(content)
    content = convert_paragraph(content)
    content = clean_data(content)
    content = convert_link(content)

    return content


def convert_heading(content):
    heading_pattern = re.compile(r"#+.+\r?")
    markdown_heading_list = re.findall(heading_pattern, content)

    for markdown_heading in markdown_heading_list:
        heading_syntax = ["######", "#####", "####", "###", "##", "#"]
        for heading in heading_syntax:
            p = re.compile(heading)
            html = markdown_heading
            if re.match(p, markdown_heading):
                html = html.replace(heading, f"<h{len(heading)}>")
                if "\r" in html:
                    html = re.sub(r"\r", f"</h{len(heading)}>", html)
                else:
                    html = html + f"</h{len(heading)}>"
                content = content.replace(markdown_heading, html)

    return(content)


def convert_bold_style(content):
    bold_pattern = re.compile(r"\*\*[^\*]+\*\*")
    markdown_bold_list = re.findall(bold_pattern, content)

    for markdown_bold in markdown_bold_list:
        html = markdown_bold
        html = re.sub(r"\*\*", "<strong>", html, count=1)
        html = re.sub(r"\*\*", "</strong>", html, count=1)
        content = content.replace(markdown_bold, html)

    return content


def convert_unordered_list(content):
    ul_pattern = re.compile(r"\*[^\*]+[^\r\n]?")
    markdown_ul_list = re.findall(ul_pattern, content)

    for i, markdown_ul in enumerate(markdown_ul_list):
        html = markdown_ul
        html = re.sub(r"\*", "<li>", html)
        html = re.sub(r"\r", "</li>", html, count=1)

        if i == 0:
            html = "<ul>" + html

        if i == len(markdown_ul_list) - 1:
            html = re.sub(r"</li>", "</li></ul>", html)

        content = content.replace(markdown_ul, html)

    return content


def convert_paragraph(content):
    p_pattern = re.compile(r".+\r")
    markdown_p_list = re.findall(p_pattern, content)

    for markdown_p in markdown_p_list:
        if any(tag in markdown_p for tag in ("<ul>", "</ul>", "<li>", "</li>", "<h", "</h")):
            continue

        html = "<p>" + markdown_p + "</p>"
        content = content.replace(markdown_p, html)

    return content


def clean_data(content):
    content = content.replace("\r", "")
    content = content.replace("\n", "")

    return content


def convert_link(content):
    link_pattern = re.compile(r"\[.+\]\(.+\)")
    markdown_link_list = re.findall(link_pattern, content)

    test = []
    for markdown_link in markdown_link_list:
        print(markdown_link)
        test.append(markdown_link)

        text = re.match(r"\[.+\]", markdown_link).group()
        link = markdown_link.replace(text, "")

        link = link.replace("(", "").replace(")", "")

        text = re.sub(r"\[", "<a href=\"" + link  + "\">", text, count=1)
        text = re.sub(r"\]", "</a>", text, count=1)

        content = content.replace(markdown_link, text)

    return content
