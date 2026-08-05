function PartCell(part, letter)
{
	return "<td brt w20><table inline " + letter + "_BG><tr><td parts>" + part + "</td></tr></table></td>";
}
function GetLetter(part)
{
	if ("SATBMLE".indexOf(part, 0) >= 0) return part;
	return "O";
}
function FixRows(data)
{
	let tabs = document.getElementsByTagName('table');
	let m = tabs.length;
	let useData = (data != undefined);
	for (let t = 0; t < m; t++)
	{
		let table = tabs[t];
		if (table.hasAttribute('fx'))
		{
			let rows = table.rows;
			for (let r = 0; r < rows.length; r++)
			{
				let row = rows[r];
				if (row.hasAttribute('tot'))
				{
					let oh = row.getAttribute('OH');
					let OH = parseInt(oh);
					let H = OH % 10;
					let O=(oh.length === 1)?H:Math.floor(OH / 10);
					let part = row.getAttribute('PL');
					if (part != null)
					{
						let letter = GetLetter(part);
						row.setAttribute(letter + '_FG', '');
					}
					const images = row.querySelectorAll('img');
					for (let i = 0; i < images.length; i++)
					{
						let image = images[i];
						if (image.hasAttribute('st'))
						{
							if (useData)
							image.src = data;
							else
							{
								image.src = '../../Control/Staff' + image.getAttribute('st') + '.svg';
							}
							image.setAttribute('STIM', '');
							let div = image.parentElement;
							div.setAttribute('PEN', '');
							div.setAttribute('PR', '');
							div.setAttribute('O' + O, '');
							div.setAttribute('H' + H, '');
							image.nextElementSibling.setAttribute('OVLIM', '');
						}
					}
				}
			}
		}
	}
}
function CheckFontSizes()
{
	let yTags = document.getElementsByTagName('y');
	for (let c = 0; c < yTags.length; c++)
	{
		let yTag = yTags[c];
		yTag.style.transform = '';
		let cell = yTag.closest('td');
		let sw = cell.scrollWidth;
		let cw = cell.clientWidth;
		if (cw < sw)
		{
			let scale = cw / sw;
			if (scale < 0.2) scale = 0.2;
			yTag.style.transform = 'scaleX(' + scale + ')';
		}
	}
}
