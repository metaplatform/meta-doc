::: sidecode

## /items/:id {.http .put}

Lorem ipsum dolor sit amet...

```javascript
var service = service.locate("db");

service("/items/1").put({
	first_name: "John",
	last_name: "Doe"
}, function(err, data){
	console.log(err, data);
});
```
:::

## Update record

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eleifend arcu vitae iaculis varius. Vestibulum faucibus convallis sem nec lobortis. Proin blandit blandit ex, ac sodales lectus posuere vel. Cras elementum, risus ut dapibus viverra, quam libero consequat lacus, aliquam pretium orci leo at odio.