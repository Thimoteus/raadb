!function(a,b){b.raadb=a;var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=require("molten-core"),w=!0;j=function(a){return console.log(a),a},k=function(a){return w?j(a):void 0},l=function(a){return a.name},m=function(a){var b;return b=a.body,JSON.parse(v.decode64(b))},n=function(a){return v.encode64(JSON.stringify(a))},o=function(a,b,e){var f,g,h;return f=c(a),g={limit:100},h=function(a,c){var d,f;return a||!c?e(new Error("Could not contact reddit")):(d=function(a){return v.includes(b,a.title)},f=v.filter(d,c),e(a,f))},d(f,g,h)},p=function(a,b,c){var d,e;return j("creating new collection "+b),e="This is a collection for [reddit as a database](https://www.github.com/thimoteus/raadb).",d=function(a,b){return a||!b?c(new Error("Could not contact reddit")):c(a,b)},f(a,b,e,d)},q=function(a,b,c,d){var e;return e=function(e,f){var g;return e?d(e):(g=function(a,b){var c=JSON.parse(b).json.data;d(a,c)},void(0===f.length&&c?p(a,b,g):f.length>0?d(e,f[0]):d(new Error("Collection "+b+" doesn't exist"))))},o(a,[b],e)},r=function(a,b,c,d){var f;return void 0===d&&(d=v.id),j("inserting new doc into "+b+":"),j(c),f=function(a,b){var f,g;return a?d(a):(f=n(c),g=function(a,c){var e;return a||!c?d(new Error("Could not contact reddit")):(e=JSON.parse(c).json.data.things[0].data.name,d(a,b,e))},e(b,f,g))},q(a,b,!0,f)},s=function(a,b,c,d){var e,f;if(v.isType("String",c))f=function(a){return l(a)===c};else{if(!v.isType("Function",c))throw new Error("query must be a string or a predicate");f=c}return e=function(b,e){return b?d(b):g(a,e,function(a,b){var e;return e=v.filter(f,b),v.isType("String",c)?d(a,e[0]):d(a,e)})},q(a,b,!1,e)},t=function(a,b,c,d){var e;return e=function(a,b){return a?d(a):(b.length?v.map(function(a){return h(a)},b):h(b),d(a))},s(a,b,c,e)},u=function(a,b,c,d,e){var f,g,h;return g=v.isType("Function",d)?function(a){return n(m(a))}:function(){return n(d)},f=function(a,b){return a?e(a):(b.length?(h=function(a){i(a,g(a))},v.map2(h,b)):i(b,g(b)),e(a))},s(a,b,c,f)},module.exports=function(a){var b=a.database,j=new(require("./middleware"))(a);j.init(),c=j.getDbEndpt,d=j.getListing,e=j.createComment,f=j.createSelfText,g=j.getCommentsFromPost,h=j.deleteThing,i=j.editComment,this.docId=l,this.docData=m,this.encodeDoc=n,this.insert=v.curry(r)(b),this.find=v.curry(s)(b),this.remove=v.curry(t)(b),this.update=v.curry(u)(b)}}({},function(){return this}());