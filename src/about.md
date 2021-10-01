---
title: About - Eleventy Photo Gallery Template
meta_desc: A page about Ronak Jethwa, and photography. This template is currently the default version so add your own about me page info here.
url: https://ronakjethwa.photos/about
img: /images/highway-water-large.jpg
alt: Terrace outside shop window with green plants and pink tree on night street
eleventyNavigation:
  key: About
  order: 2
heading: About
permalink: "/about/"
layout: main.njk
---

<div class="about-me-content">

# {{ heading }}

Hi, I'm {{ site.author.firstName }} {{ site.author.lastName}}. I carry the blend of front-end and design knowledge that helps me deliver better looking products.

<h2 id="contact-me">Contact</h2>

Feel free to reach out to me by email on [on my email](mailto:{{ site.author.email }}). 

You can also find me on <a href="{{ site.socials.twitter }}" target="_blank">Twitter</a>, <a href="{{ site.socials.instagram }}" target="_blank">Instagram</a> or <a href="{{ site.socials.github}}" target="_blank">GitHub</a>.

</div>