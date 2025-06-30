import {test, expect} from '@playwright/test'


test.describe('testing each functionalities',()=>{
    test.beforeEach("Everytime visit a website",async({page})=>{
    await page.goto("https://typing-test-prj.vercel.app/");
    })
    test("testing each block is shown or not", async({page})=>{
        expect(page.locator('.mtitle')).toHaveText("DuckKeys"); //page heading
        //instructions
        expect(page.locator('.inst')).toBeVisible();
        //quote box 
        const quote= await page.locator("#proverb");
        await expect(quote).not.toBeEmpty();
        //input box
        const inputbox= await page.getByPlaceholder("Start typing here...");
        await expect(inputbox).toBeEmpty();
        //board
        expect(page.locator('.board')).toHaveText("Leaderboard");
        //timer
        expect(page.locator('.timer')).toBeVisible();
        //hidden-Restart button
        await expect(page.locator('#restart')).toHaveClass('hid-restart')
        await page.waitForTimeout(3000);
    })

    test('timer function',async({page})=>{
        await page.fill("#input",'a');
        await page.waitForTimeout(2000);
        const timer= await page.locator('#value').textContent();
        await expect(timer).not.toBe("00:00:00");
    })

    test("Blocks incorrect input",async({page})=>{
        const qtext=await page.locator('#proverb').textContent();
        const crtchar= qtext?.charAt(0) ?? '';
        const wrongchar= crtchar=== 'a' ? 'z' : 'a';
        //initiate to print wrong char
        await page.fill('#input',wrongchar);
        const inputval=await page.locator('#input').inputValue();
        await expect(inputval).toBe('');
    })

    test('shows result popup', async ({ page }) => {
    await page.fill('#input', 'A'); // to start the timer
    await page.waitForTimeout(61000);
    const popup = page.locator('#res-popup');
    await expect(popup).toBeVisible();
  });
  
    test('restart button is visile',async({page})=>{
        await page.fill('#input', 'A');
        await expect(page.locator('#restart')).not.toHaveClass('hid-restart');
    })
    
    test('another quote is loaded after clicking restart button',async({page})=>{
        const qtext=await page.locator('#proverb').textContent();
        const trimquote= qtext?.trim() ?? '';
        await page.fill('#input', 'A');
        await page.click('#restart');
        const anotherquote=await page.locator('#proverb').textContent();
        const anothertrimquote=anotherquote?.trim() ?? '';
        await expect(anothertrimquote).not.toBe(trimquote);

    })

    test("Another quote is loaded after one completed",async({page})=>{
        const qtext=await page.locator('#proverb').textContent();
        const trimquote= qtext?.trim() ?? '';
        await page.fill("#input",trimquote);
        await page.waitForTimeout(1000);
        const anotherquote=await page.locator('#proverb').textContent();
        const anothertrimquote=anotherquote?.trim() ?? '';
        await expect(anothertrimquote).not.toBe(trimquote);
    })

    test("testing leaderboard functionality",async({page})=>{
        await page.fill('#input', 'A');
        await page.waitForTimeout(61000);
        const leaderboardlist= page.locator('#leaderboard li');
        await expect(leaderboardlist.first()).toBeVisible();
        const text = await leaderboardlist.first().textContent();
        expect(text).toMatch(/% accuracy/);
    })
    test('changing color according to input',async({page})=>{
        const qtext=await page.locator('#proverb').textContent();
        const crtchar= qtext?.trim().charAt(0) || 'a';
        const wrongchar= crtchar=== 'a' ? 'd' : 'a';

       await page.fill("#input",crtchar);
       const firstletter=await page.locator('#proverb span').first();
       await expect(firstletter).toHaveClass(/active/);

       await page.fill('#input', '');
       await page.fill('#input', wrongchar);
       await expect(firstletter).toHaveClass(/incorrect/);
  })
})

