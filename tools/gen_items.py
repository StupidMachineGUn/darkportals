# Regenerates server/src/items.json (item catalog the server validates saves against). Run after editing client items:
#   bash client/build.sh && python3 tools/gen_items.py
import asyncio,json,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();await pg.goto('file://'+sys.argv[1]);await pg.wait_for_timeout(800)
        d=await pg.evaluate("Object.fromEntries(Object.entries(ITEMS).map(([k,v])=>[k,{v:v.v|0,s:v.slot||0,st:v.slot?0:1}]))")
        sk=await pg.evaluate("SK.map(s=>s[0])")
        json.dump({'items':d,'skills':sk},open(sys.argv[2],'w'),separators=(',',':'));print(len(d),'items',sk);await b.close()
asyncio.run(main())
