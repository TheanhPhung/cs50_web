import re

from . import util


def convert(title):
    content = util.get_entry(title)
    content = convert_heading(content)
    content = convert_bold_style(content)

    return content


def convert_heading(content):
    heading_pattern = re.compile(r"#+.*[\n|\r|\\]?")
    markdown_heading_list = re.findall(heading_pattern, content)

    for markdown_heading in markdown_heading_list:
        heading_syntax = ["######", "#####", "####", "###", "##", "#"]
        for heading in heading_syntax:
            p = re.compile(heading)
            html = markdown_heading
            if re.match(p, markdown_heading):
                html = html.replace(heading, f"<h{len(heading)}>") + f"</h{len(heading)}>"
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
