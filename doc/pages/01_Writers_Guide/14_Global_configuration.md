## Global configuration

Global configuration is defined by `config.json` file which is placed in documentation root directory. This file is mandatory and defines global configuration properties.

These properties are passed to templates which is the main purpose of them.

Default template uses following properties.

:::sidecode-h3
### Example configuration
./config.json

```json
{
	"title": "META Doc",
	"description": "Project documentation generator with support of HTML and Markdown pages.",
	"keywords": "documentation generator doc api meta readme",
	"meta": {
		"author": "META Platform team"
	},
	"header_title": "<strong>META</strong>Platform <span>Codebase</span>",
	"header_image": "$media$/header.jpg",
	"header_image_position": "top",
	"header_github": "https://github.com/metaplatform",
	"header_github_label": "GitHub Page",
	"google_analytics": "UA-12345678-1",
	"menu": [
		{
			"label": "Project homepage",
			"link": "http://www.meta-platform.com/",
			"target": "_blank"
		},
		{
			"label": "Support",
			"link": "http://www.meta-platform.com/contact/"
		}
	],
	"footer_links": [
		{
			"label": "Support &amp; contact",
			"link": "$base$/meta/#01_Support"
		},
		{
			"label": "Privacy Policy",
			"link": "$base$/meta/#02_Privacy_Policy"
		},
		{
			"label": "Report an issue",
			"link": "https://github.com/metaplatform/meta-doc/issues",
			"target": "_blank"
		},
		{
			"icon": "facebook-box",
			"link": "https://www.facebook.com/",
			"target": "_blank"
		}
	],
	"base_path": "my-project/my-doc",
	"rewrite_base": "/my-project/my-doc",
	"rewrite": {
    	"^beginners-guide/$": "writers-guide/",
    	"^contact/$": "support/#contact"
	}
}
```
:::

### General

| Property name | Type | Description |
| ------------- | ---- | ----------- |
| title\* | string | Global page title - HTML <title> tag. |
| description\* | string | HTML meta description tag contents. |
| keywords\* | string | HTML meta keywords tag contents. |
| meta | object | HTML meta tags in form of key-value. |
| header_title\** | string | Specifies title in header toolbar. |
| header_image | string | Overrides default header toolbar background image URL. |
| header_image_position | string | Overrides default header toolbar background image alignment. It is CSS value. |
| header_github | string | If set then GitHub button is displayed in header toolbar. Property specifies URL to GitHub profile or repository page. |
| header_github_label | string | Overrides default header toolbar GitHub button label. |
| menu | array | Specifies header toolbar menu items - see below. |
| footer_links | array | Specifies footer menu items - see below. |
| footer_text | string | Specifies footer text area contents. |
| google_analytics | string | Specifies Google Analytics tracking code. If set then tracking script will be automaticaly printed on each page. |
| base_path | string | Base path for links without leading dash - absolute URL path to documentation, required when using 404 page. |
| rewrite_base | string | Base path for mod_rewrite. This value is compiled into `.htaccess` file. |
| rewrite | object | Rewrite rules which are compiled into `.htaccess` and `rewrite.json` files. See [Redirects section](#16_Redirects) for more information. |
| sitemap | object | Sitemap generator configuration. See [Sitemap section](#17_Sitemap) |

**\* recommended**  

### Menu items format

Menu items are specified as an array of item objects. Each item should be defined with following properties.

| Property name | Type | Description |
| ------------- | ---- | ----------- |
| link\** | string | URL of link |
| label\*  | string | Link label |
| target | string | Hyperlink target |
| icon | string | MDI icon of link - works only for `footer_links` property. |

**\* recommended**  
**\*\* mandatory**