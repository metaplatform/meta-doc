## Sitemap

META Doc comes with another `sitemap` compiler which generates sitemap XML file for search engines.

:::sidecode
### Sample global `config.json`
```json
{
	"sitemap": {
		"base_url": "http://code.meta-platform.com",
		"exclude": [ "/404/" ],
		"output_path": "/my_sitemap.xml"
	}
}
```
:::

To use sitemap generator you must provide following configuration properties in global config.

| Name | Type | Description |
| ---- | ---- | ----------- |
| base_url* | string | Absolute URL to your website without ending slash |
| exclude | array | Array of page paths to exclude from sitemap |
| output_path | string | Path to sitemap file with leading slash, defaults to `/sitemap.xml` |

__* mandatory__

### Where to go next?

[[cta href=../usage/ ]][[icon console /]] Usage[[/cta]] [[cta href=../api-reference/ ]][[icon code-tags /]] API Reference[[/cta]]