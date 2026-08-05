'use strict';
let media, positionData, topBar, unhideDiv, btnPlay, btnStop, btnHide;
let barTable, controlWidth, controlHeight;
let btnInc, btnDec, btnNorm;
let numerator, denominator;
let dataType;
let rangePos, elePosition, rangeSpeed, elePlaybackRate, rangeVol;
let rangeWidth;
let cellBeatNo, cellBarNo;
let maxBar=0, maxBeatsPerBar = 0;
let barThickness = 84;
let blnBarVisible = true;
let blnPositioning = false;
let currentRow = null;
let theBegining = 0;
let blnStopped = true;
let blnCancelScroll = false;
let container, scoreSrc;
let scoreSourceAddress = null;
let resizerSize = 10;
let isTouchDeviceOrNoScores = false;
let blnLockPlay = false;
let blnPlayButtonsLocked = false;
function TogglePlayButtonLock()
{
	if (document.getElementById('lock').checked === true)
	LockPlayButtons();
	else UnlockPlayButtons();
}
function LockPlayButtons()
{
	blnPlayButtonsLocked = true;
	media.pause();
	btnPlay.style.color = 'lightgrey';
	btnStop.style.color = 'lightgrey';
	document.getElementById('lock').checked = true;
}
function UnlockPlayButtons()
{
	blnPlayButtonsLocked = false;
	btnPlay.style.color = 'white';
	btnStop.style.color = 'white';
	checkLockPlay.checked = false;
	document.getElementById('lock').checked = false;
}
function LockPlayOnRowClick()
{
	blnLockPlay = true;
	UnhighlightRow();
	StopMonitor();
	media.pause();
}
function UnlockPlayOnRowClick()
{
	blnLockPlay = false;
}
function UnhighlightRow()
{
	HighlightRow(null);
}
const backColor = "transparent";
function HighlightRow(row)
{
	if (row == currentRow) return;
	if (currentRow != null) currentRow.style.backgroundColor = backColor;
	currentRow = row;
	if (currentRow != null) currentRow.style.backgroundColor = "yellow";
}
function OnPause()
{
	if (blnStopped) return;
	UpdateStatus();
}
function OnResumeOrPlay()
{
	blnStopped = false;
	MonitorRow();
	UpdateStatus();
}
function SetPosLabel(value = null)
{
	if (value != null)
	{
		value = Math.floor(value);
		if (!blnPositioning) rangePos.value = value;
	}
	else value = rangePos.value;
	elePosition.innerText = value + "/" + rangePos.max;
}
let fontSize = 100;
function FixButton(button, disable)
{
	button.disabled = disable;
	button.style.backgroundColor = disable ? "gray" : "#202020";
}
function SetFontEnables()
{
	FixButton(btnInc, fontSize >= 200);
	FixButton(btnDec, fontSize <=70);
	FixButton(btnNorm, fontSize > 95 && fontSize < 105)
	document.getElementById("lyrics").style.fontSize = fontSize + '%';
	btnNorm.innerHTML = 5 * Math.round(fontSize / 5) + "<sup>%</sup>";
	CheckFontSizes();
}
function DoDec()
{
	fontSize *= 0.9;
	SetFontEnables();
}
function DoInc()
{
	fontSize /= 0.9;
	SetFontEnables();
}
function DoNorm()
{
	fontSize = 100;
	SetFontEnables();
}
function DoPlay()
{
	blnStopped = false;
	if (media.paused)
	{
		if (media.currentTime < theBegining) media.currentTime = theBegining;
		if (!blnPlayButtonsLocked) media.play();
		MonitorRow();
	}
	else
	{
		CancelScroll();
		media.pause();
		StopMonitor();
	}
}
function DoStop()
{
	if (blnStopped) return;
	CancelScroll();
	blnStopped = true;
	media.pause();
	media.currentTime = theBegining;
	window.scrollTo(0, 0);
	UnhighlightRow(currentRow);
	StopMonitor();
	UpdateStatus();
	if ((dataType & 2) != 0)
	{
		cellBeatNo.innerText ='1';
		cellBarNo.innerText = positionData[0].Bar;
	}
}
function CancelScroll()
{
	blnCancelScroll = true;
}
function PxToVh(pixels)
{
	return (pixels / window.innerHeight) * 100;
}
function PxToHw(pixels)
{
	return (pixels / window.innerWidth) * 100;
}
function HideBar()
{
	topBar.style.display = 'none';
	unhideDiv.style.Order = 9999;
	blnBarVisible = false;
	btnHide.title = 'Unhide Controls';
	EnsureCorrectSizes();
}
function ToggleHide()
{
	if (blnBarVisible) HideBar();
	else UnhideBar();
}
function UnhideBar()
{
	topBar.style.display = 'block';
	unhideDiv.style.Order = 9999;
	blnBarVisible = true;
	btnHide.title = 'Hide Controls';
	EnsureCorrectSizes();
}
function ShowNote(event)
{
	return;
	const rect = event.currentTarget.getBoundingClientRect();
	console.log((event.clientX-rect.left) + " " + (event.clientY-rect.top));
}
function AutoTableClick(event)
{
	const td = event.currentTarget;
	const tr = td.parentElement;
	const row = tr.parentElement.closest('tr');
	if ('play' === playHow)
	{
		//	const row = tr.parentElement.closest('tr');
		let prop = 0 + td.getAttribute('o') / tr.getAttribute('tot');
		PlayRow(row, prop);
	}
	else if (playHow=='highlight')
	{
		MoveToRow(row);
	}
	event.stopPropagation();
}
function InnerHeight()
{
	return (window.innerHeight - ((blnBarVisible) ? barThickness : 0)) -15;
}
function InnerWidth()
{
	return window.innerWidth - resizerSize;
}
function EnsureCorrectSizes()
{
	let theWidth = InnerWidth() + 'px';
	let theHeight = InnerHeight() + 'px';
	container.style.width = theWidth;
	container.style.height = theHeight;
	container.style.marginTop = '0px';
	if (blnLeftToRight)
	{
		lyricPanel.style.height = theHeight;
		if (isTouchDeviceOrNoScores)
		{
			lyricPanel.style.width = (container.offsetWidth - resizerSize) + 'px';
		}
		else
		{
			scorePanel.style.height = theHeight;
			scoreSrc.style.height = theHeight;
			resizer.style.height = theHeight;
			resizer.style.width = resizerSize + 'px';
			let w = container.offsetWidth - lyricPanel.offsetWidth - resizerSize;
			scorePanel.style.flexBasis = w + 'px';
			scorePanel.style.width = w + 'px';
			scoreSrc.style.width = w + 'px';
		}
	}
	else
	{
		lyricPanel.style.width = theWidth;
		if (isTouchDeviceOrNoScores)
		{
			lyricPanel.style.height = (container.offsetHeight - resizerSize) + 'px';
		}
		else
		{
			resizer.style.width = theWidth;
			resizer.style.height = resizerSize + 'px';
			scorePanel.style.width = theWidth;
			scoreSrc.style.width = theWidth;
			let h = container.offsetHeight - lyricPanel.offsetHeight - resizerSize;
			scorePanel.style.flexBasis = h + 'px';
			scoreSrc.style.height = h + 'px';
		}
	}
}
const playIcon = '\u25B6';
const stopIcon = '\u23F9';
const pauseIcon = '\u23F8';
const resumeIcon = '\u23EF';
function UpdateStatus()
{
	let color = 'white';
	let disabled = false;
	if (blnStopped)
	{
		disabled = true;
		btnPlay.innerText = playIcon;
		color = 'gray';
	}
	else if (media.paused)
	{
		btnPlay.innerText = resumeIcon;
	}
	else
	{
		btnPlay.innerText = pauseIcon;
	}
	btnStop.style.color = color;
	btnStop.disabled = disabled;
}
let rowClickTime = 0;
function RowClick(event)
{
	if (playHow === 'highlight')
	{
		const row = event.srcElement.closest('tr');
		MoveToRow(row);
	}
	else if (playHow==='play')
	{
		let now = new Date().getTime();
		if (now - rowClickTime < 500) return;
		rowClickTime = now;
		PlayRow(event.srcElement.closest('tr'), 0);
	}
}
function PlayIndex(index)
{
	try
	{
		CancelScroll();
		media.currentTime = positionData[index].Time;
		if (!blnPlayButtonsLocked) media.play();
		MonitorRow(index);
		return true;
	}
	catch
	{
		return false;
	}
}
function MoveToRow(row)
{
	UnhighlightRow();
	HighlightRow(row);
	try
	{
		let index = parseInt(row.id.substring(1));
		let beg = positionData[index].Time;
		media.currentTime = beg;
	}
	catch
	{
	}
}
function PlayRow(row, propInto)
{
	if (blnPlayButtonsLocked) return;
	let index, beg;
	try
	{
		index = parseInt(row.id.substring(1));
		beg = positionData[index].Time;
	}
	catch
	{
		return;
	}
	CancelScroll();
	let offset = 0;
	if (propInto>0)
	{
		const end = positionData[index + 1].Time;
		offset = (end - beg) * propInto;
	}
	media.currentTime = beg + offset;
	media.play();
	MonitorRow(index);
}
let oldBeatSize, oldBeatsInBar;
let scrollDuration = 0;
function CheckForAutoScroll(instant, lowBarData)
{
	try
	{
		{
			let theBarBottom = blnBarVisible ? barThickness : 0;
			let rectRow = lowBarData.Row.getBoundingClientRect();
			let rowHeight = rectRow.bottom - rectRow.top;
			let theDiv = lyricPanel;
			let rc = theDiv.getBoundingClientRect();
			let theDivHeight = rc.bottom - rc.top;
			if (rectRow.bottom > rc.bottom - rowHeight || rectRow.top < theBarBottom)
			{
				let moveBy = rectRow.top - theBarBottom;
				let newScrollTop = moveBy + theDiv.scrollTop;
				if (instant || moveBy < 0)
				{
					const options = new Scroll(0, newScrollTop, 'instant');
					theDiv.scrollTo(options);
				}
				else
				{
					if (rectRow.top > rc.bottom)
					{
						const options = new Scroll(0, newScrollTop - theDivHeight, 'instant');
						theDiv.scrollTo(options);
					}
					blnCancelScroll = false;
					let scrollDuration = lowBarData.BeatsPerBar * lowBarData.MillisecondsPerBeat / media.playbackRate;
					SmoothScrollTo(theDiv, newScrollTop, scrollDuration * 0.75);
				}
			}
		}
	}
	catch
	{ }
	}
	let barData = null;
	let oldBarNo = -999999;
	let oldBeatNo = -1;
	function StopMonitor()
	{
		if (barData != null)
		{
			barData.ResetBackgrounds(backColor);
			barData = null;
		}
		oldBarNo = -999999;
		oldBeatNo = -1;
	}
	let posDiv=null;
	function MonitorRow(index)
	{
		let instant = index === undefined;
		if (instant) index = findIndexForTime(media.currentTime);
		if (positionData[index] === barData) return;
		StopMonitor();
		if (media.paused) return;
		try
		{
			barData = positionData[index];
			HighlightRow(barData.Row);
			numerator.innerText = barData.BeatsPerBar;
			denominator.innerText = barData.BeatSize;
		}
		catch
		{
			barData = null;
			return;
		}
		CheckForAutoScroll(instant, barData);
		let cellFirst, cellLast;
		let oldPos = 0;
		let rowInfos;
		if (barData.AutoTable)
		{
			if (posDiv === null)
			{
				posDiv = document.createElement('div');
				posDiv.id = 'posdiv';
				posDiv.style.position = "absolute";
				posDiv.style.width = '3px';
				posDiv.style.backgroundColor = 'darkred';
			}
			rowInfos = barData.RowInfos;
			let table = rowInfos[0].AutoRow.closest('table');
			table.style.position = 'relative';
			table.appendChild(posDiv);
			posDiv.style.top = 0;
			posDiv.style.height = table.offsetHeight + "px";
			let rowInfo = rowInfos[0];
			let pointerFirst = rowInfo.AutoPointer[0];
			let pointerLast = rowInfo.AutoPointer[rowInfo.AutoPointer.length - 1];
			cellLast = rowInfo.AutoRow.cells[pointerLast];
			cellFirst = rowInfo.AutoRow.cells[pointerFirst];
			oldPos = (cellFirst.offsetLeft - 1);
			posDiv.style.left = (oldPos) + "px";
		}
		else if(posDiv != null)
		{
			posDiv.remove();
		}
		function CallBackAnimate(timeStamp)
		{
			if (barData === null) return;
			if (media.paused) return;
			const currentTime = media.currentTime;
			const elapsed = (media.currentTime - barData.Time) / barData.Duration;
			if (elapsed < 0)
			{
				setTimeout(MonitorRow, 1);
				return;
			}
			else if (elapsed > 1)
			{
				setTimeout(MonitorRow, 1, barData.Index + 1);
				return;
			}
			if (!blnPositioning)
			{
				if (dataType == 1) SetPosLabel(currentTime);
				else SetPosLabel(barData.Bar);
			}
			if ((dataType & 2) != 0)
			{
				let barNo = barData.Bar;
				let beatNo = barData.CurrentBeat(currentTime) - 1;
				if (beatNo >= barData.BeatsPerBar)
				{
					let extra = Math.floor(beatNo / barData.BeatsPerBar);
					barNo += extra;
					beatNo %= barData.BeatsPerBar;
				}
				{
					if (oldBeatNo != beatNo)
					{
						cellBeatNo.innerText = beatNo+1;
						oldBeatNo = beatNo;
					}
					if (oldBarNo != barNo)
					{
						cellBarNo.innerText = barNo;
						oldBarNo = barNo;
					}
				}
			}
			let showProgress=true;
			if (barData.AutoTable && showProgress)
			{
				let pos = cellFirst.offsetLeft + (cellLast.offsetLeft + cellLast.offsetWidth - cellFirst.offsetLeft) * elapsed - 1;
				oldPos = pos;
				posDiv.style.left = pos + "px";
				for (let r = 0; r < barData.RowInfos.length; r++)
				{
					let rowInfo = barData.RowInfos[r];
					let indexProp = Math.floor(elapsed * rowInfo.AutoTotal);
					if (indexProp != rowInfo.OldIndexProp)
					{
						let pointer = rowInfo.AutoPointer[indexProp];
						if (pointer != rowInfo.OldPointer)
						{
							rowInfo.AutoRow.cells[pointer].style.backgroundColor = rowInfo.BackColor;
							if (rowInfo.OldPointer >= 0)
							rowInfo.AutoRow.cells[rowInfo.OldPointer].style.backgroundColor = backColor;
							rowInfo.OldPointer = pointer;
						}
						rowInfo.OldIndexProp = indexProp;
					}
				}
			}
			requestAnimationFrame(CallBackAnimate);
		}
		requestAnimationFrame(CallBackAnimate);
	}
	function SmoothScrollTo(container, targetY, duration)
	{
		const startY = container.scrollTop;
		const distance = targetY - startY;
		let startTime = null;
		const options = new Scroll(0, 0, 'instant');
		let atimeout;
		function AnimateScroll(currentTime)
		{
			if (blnCancelScroll) return;
			if (!startTime) startTime = currentTime;
			const progress = (currentTime - startTime) / duration;
			options.SetTop(startY + distance * progress);
			container.scrollTo(options);
			if (progress < 1)
			{
				clearTimeout(atimeout);
				atimeout = setTimeout(doNothing, 1);
				requestAnimationFrame(AnimateScroll);
			}
		}
		function doNothing()
		{
		}
		requestAnimationFrame(AnimateScroll);
	}
	class Scroll
	{
		constructor(left, top, behaviour = 'instant')
		{
			this.left = left;
			this.top = top;
			this.behavior = behaviour;
		}
		SetTop(t)
		{
			this.top = t;
		}
	}
	class Styler
	{
		constructor()
		{
		}
		BeginNew()
		{
			this.style = document.createElement('style');
		}
		Add(selector, styles)
		{
			if (this.style == null) this.BeginNew();
			this.style.appendChild(document.createTextNode(selector + ' {' + styles + '}'));
		}
		Finish()
		{
			document.head.appendChild(this.style);
			this.style = null;
		}
	}
	class RowInfo
	{
		constructor(row)
		{
			const td = row.getElementsByTagName('td');
			let offsets = new Array(td.length);
			let nOffsets = 0;
			let total = 0;
			let firstCellIndex = -1;
			for (let i = 0; i < td.length; i++)
			{
				let cell = td[i];
				if (cell.hasAttribute('o'))
				{
					if (firstCellIndex < 0) firstCellIndex = cell.cellIndex;
					offsets[nOffsets++] = parseInt(cell.getAttribute('o'));
				}
			}
			total = parseInt(row.getAttribute('tot'));
			let backColor = '#C0C0FF';
			let letter = row.getAttribute('pl');
			switch (letter)
			{
				case 'B':
				backColor = '#c0c0c0';
				break;
				case 'T':
				backColor = '#c0FFc0';
				break;
				case 'S':
				backColor = '#FFc0c0';
				break;
				case 'A':
				backColor = '#FFc0FF';
				break;
				case 'L':
				backColor = 'MistyRose';
				break;
				case 'M':
				backColor = 'LightBlue';
				break;
				default:
				letter = 'O';
				break;
			}
			this.BackColor = backColor;
			offsets.length = nOffsets;
			let align = 16;
			for (let i = 0; i < nOffsets; i++)
			{
				let al = offsets[i] & 15;
				if (al > 0)
				{
					al = al & 7;
					if (al === 4)
					{
						align = 4;
						break;
					}
					else align = 8;
				}
			}
			total /= align;
			for (let i = 0; i < nOffsets; i++)
			offsets[i] /= align;
			offsets[nOffsets] = total;
			let length = new Array(nOffsets);
			for (let i = 0; i < nOffsets; i++)
			length[i] = offsets[i + 1] - offsets[i];
			const pointer = new Array(total);
			let k = 0;
			for (let i = 0; i < nOffsets; i++)
			{
				for (let o = 0; o < length[i]; o++)
				pointer[k++] = i + firstCellIndex;
			}
			this.AutoPointer = pointer;
			this.AutoTotal = total;
			this.AutoRow = row;
			this.OldPointer = -1;
			this.OldIndexProp = -1;
		}
		Reset(color)
		{
			if (this.OldPointer >= 0)
			{
				this.AutoRow.cells[this.OldPointer].style.backgroundColor = color;
				this.OldPointer = -1;
			}
			this.OldIndexProp = -1;
		}
	}
	class BarData
	{
		constructor(index, time, bar, beatNo, beatsPerBar, millisecondsPerBeat, beatSize, row, isFX)
		{
			this.Index = index;
			this.Time = time;
			this.Bar = bar;
			this.BeatsPerBar = beatsPerBar;
			this.BeatSize = beatSize;
			this.BeatNo = beatNo;
			this.Row = row;
			this.MillisecondsPerBeat = millisecondsPerBeat;
			this.AutoTable = isFX;
			this.Duration = 0;
			if (isFX)
			{
				let table = row.getElementsByTagName('table');
				let isFX = false;
				for (let t = 0; t < table.length; t++)
				if (table[t].hasAttribute('fx'))
				{
					let rows = table[t].getElementsByTagName('tr');
					let rowInfos = new Array(rows.length);
					let nr = 0;
					for (let r = 0; r < rows.length; r++)
					{
						let aRow = rows[r];
						if (aRow.hasAttribute('tot'))
						{
							rowInfos[nr++] = new RowInfo(aRow);
						}
					}
					rowInfos.length = nr;
					this.RowInfos = rowInfos;
					this.NumberOfRowInfos = nr;
					break;
				}
			}
			return;
		}
		ResetBackgrounds(color)
		{
			for (let r = 0; r < this.NumberOfRowInfos; r++)
			this.RowInfos[r].Reset(color);
		}
		OffsetMillisecondsToBeat(n)
		{
			return (n - this.BeatNo) * this.MillisecondsPerBeat;
		}
		CurrentBeat(timeInSeconds)
		{
			let milliseconds = (timeInSeconds - this.Time) * 1000;
			return Math.floor(milliseconds / this.MillisecondsPerBeat) + this.BeatNo;
		}
		CurrentBar(timeInSeconds)
		{
			let b = this.CurrentBeat(timeInSeconds) - 1;
			return Math.floor(b / this.BeatsPerBar) + this.Bar;
		}
		NumberOfBeatsTo(bd)
		{
			let p1 = this.Bar * this.BeatsPerBar + this.BeatNo;
			let p2 = bd.Bar * this.BeatsPerBar + bd.BeatNo;
			return p2 - p1;
		}
	}
	function findIndexForBar(bar)
	{
		let leftIndex = 0;
		let rightIndex = positionData.length - 1;
		while (leftIndex <= rightIndex)
		{
			const mid = ~~Math.floor((leftIndex + rightIndex) * 0.5);
			if (bar >= positionData[mid].Bar)
			{
				const upper = mid < positionData.length - 1 ? positionData[mid + 1].Bar : 9999999999;
				if (bar < upper) return mid;
				else leftIndex = mid + 1;
			}
			else rightIndex = mid - 1;
		}
		return -1;
	}
	function findIndexForTime(time)
	{
		let leftIndex = 0;
		let rightIndex = positionData.length - 1;
		while (leftIndex <= rightIndex)
		{
			const mid = ~~Math.floor((leftIndex + rightIndex) * 0.5);
			if (time >= positionData[mid].Time)
			{
				const upper = mid < positionData.length - 1 ? positionData[mid + 1].Time : 9999999999;
				if (time < upper) return mid;
				else leftIndex = mid + 1;
			}
			else rightIndex = mid - 1;
		}
		return -1;
	}
	function GetPos(range, ev)
	{
		const w = 4;
		let r = range.getBoundingClientRect();
		let x = ev.clientX - (r.left+w);
		let minValue = ~~range.min;
		if (x <= 0) return minValue;
		let width = r.right - r.left -2*w;
		let maxValue = ~~range.max;
		if (x >= width) return maxValue;
		return minValue + Math.floor((maxValue - minValue) * x / width);
	}
	function SetMediaPosition(ev)
	{
		CancelScroll();
		let value = GetPos(rangePos, ev);
		if (value == null) return;
		if (dataType == 1)
		{
			if (value < theBegining) value = theBegining;
			media.currentTime = value;
		}
		else
		{
			let index = findIndexForBar(value);
			if (index >= 0) media.currentTime = positionData[index].Time;
			cellBeatNo.innerText = '1';
			cellBarNo.innerText = positionData[index].Bar;
			if (media.paused)
			{
				HighlightRow(positionData[index].Row);
				positionData[index].Row.scrollIntoView({ behavior: 'smooth' });
			}
		}
		MonitorRow();
	}
	let createdInner = null;
	function CreateInnerCell()
	{
		if (createdInner !== null) return createdInner;
		let span, xtd;
		let td = document.createElement('td');
		td.setAttribute('ot', '');
		let innerTable = document.createElement('table');
		innerTable.setAttribute('st', '');
		let aRow = innerTable.insertRow();
		xtd = aRow.insertCell();
		xtd.setAttribute('sc', '');
		xtd.id = "sig";
		span = document.createElement('span');
		span.setAttribute('lo', '');
		span.id = 'bpb';
		xtd.appendChild(span);
		xtd.appendChild(document.createElement('br'));
		span = document.createElement('span');
		span.setAttribute('hi', '');
		span.id = 'bs';
		xtd.appendChild(span);
		td.appendChild(innerTable);
		xtd = aRow.insertCell();
		xtd.setAttribute('dc', '1');
		span = document.createElement('span');
		span.id = 'timeSpan';
		span.setAttribute('lo', '');
		xtd.appendChild(span);
		xtd.appendChild(document.createElement('br'));
		span = document.createElement('span');
		span.id = 'dynSpan';
		span.setAttribute('hi', '');
		span.setAttribute('t', '');
		xtd.appendChild(span);
		td.appendChild(innerTable);
		createdInner = td;
		return td;
	}
	let mainTable;
	const dicVisible = { v1: false, v2: false };
	function SetVisibility(vWhat, val)
	{
		if (dicVisible[vWhat] === val) return;
		dicVisible[vWhat] = val;
		let temp = document.getElementsByTagName(vWhat);
		for (let i = 0; i < temp.length; i++)
		{
			temp[i].classList.toggle('hide', !val);
		}
	}
	function SetVHides()
	{
		let barVis = document.getElementById('barHide').checked;
		if (barVis)
		{
			SetVisibility('v1', false);
			SetVisibility('v2', false);
		}
		else
		{
			let partVis = document.getElementById('partHide').checked;
			if (partVis)
			{
				SetVisibility('v1', false);
				SetVisibility('v2', true);
			}
			else
			{
				SetVisibility('v1', true);
				SetVisibility('v2', false);
			}
		}
	}
	function ToggleSignatureColumn(event)
	{
		let val=!event.srcElement.checked;
		let temp = mainTable.rows;
		for (let i = 0; i < temp.length; i++)
		{
			if (temp[i].hasAttribute('t'))
			{
				temp[i].cells[0].classList.toggle('hide', val);
			}
		}
		SetVisibility('v1', val)
		CheckFontSizes();
	}
	function TogglePartColumn(event)
	{
		let table = mainTable.getElementsByTagName('table');
		let val = !event.srcElement.checked;
		for (let i = 0; i < table.length; i++)
		{
			if (table[i].hasAttribute('fx'))
			{
				//let rows = table[i].getElementsByTagName('tr');
				let rows = table[i].rows;
				for (let r = 0; r < rows.length; r++)
				if (r==0||rows[r].hasAttribute('tot')) rows[r].cells[0].classList.toggle('hide', val);
				else if (rows[r].hasAttribute('dr')) rows[r].cells[0].classList.toggle('hide',val);
			}
		}
		CheckFontSizes();
	}
	function FixTable()
	{
		mainTable = document.getElementById('lyrics');
		mainTable.style.userSelect = 'none';
		dataType = parseInt(mainTable.getAttribute('type'));
		let length = Math.floor(parseFloat(mainTable.getAttribute('length')));
		let temp = mainTable.getElementsByTagName('tr');
		let rows = new Array(temp.length);
		let nRows = 0;
		for (let i = 0; i < temp.length; i++)
		{
			if (temp[i].hasAttribute('t')) rows[nRows++] = temp[i];
		}
		positionData = new Array(nRows + 1);
		let oldBar = 0;
		let oldBeatsPerBar = 4;
		let oldBeatSize = 4;
		let oldBeatNo = 1;
		let oldColor = 'black';
		let oldDynamic = '';
		let oldMillisecondsPerBeat = 1;
		let bar;
		let beatNo;
		minPosValue = 99999999;
		maxPosValue = -99999999;
		positionData[0] = new BarData(0, 0, 0, 0, 0, 0, null,false);
		let infoCell = CreateInnerCell();
		infoCell.style.width='2em';
		let beatsPerBar, beatSize;
		for (let index = 0; index < nRows; index++)
		{
			let row = rows[index];
			let isBar = false;
			let changeSig = false;
			row.setAttribute('id', 'M' + index);
			let time = parseFloat(row.getAttribute('t'));
			let specialCell = null;
			let partsTable = null;
			if (row.hasAttribute('tx'))
			{
				isBar = false;
				positionData[index] = new BarData(index,time, 0, 0, 0, 0, 0, row,false);
			}
			else
			{
				isBar = true;
				oldBar++;
				bar = oldBar;
				beatsPerBar = oldBeatsPerBar;
				beatSize = oldBeatSize;
				let millisecondsPerBeat = oldMillisecondsPerBeat;
				beatNo = oldBeatNo;
				if (row.hasAttribute('b'))
				{
					bar = parseInt(row.getAttribute('b'));
					row.removeAttribute('b');
					oldBar = bar;
				}
				if (row.hasAttribute('bn'))
				{
					beatNo = parseInt(row.getAttribute('bn'));
					oldBeatNo = beatNo;
				}
				if (row.hasAttribute('bs'))
				{
					beatSize = parseInt(row.getAttribute('bs'));
					oldBeatSize = beatSize;
					if (oldBeatSize !== beatSize) changeSig = true;
				}
				if (row.hasAttribute('pb'))
				{
					beatsPerBar = parseInt(row.getAttribute('pb'));
					if (oldBeatsPerBar !== beatsPerBar) changeSig = true;
					oldBeatsPerBar = beatsPerBar;
					if (beatsPerBar > maxBeatsPerBar) maxBeatsPerBar = beatsPerBar;
				}
				if (row.hasAttribute('ms'))
				{
					millisecondsPerBeat = parseInt(row.getAttribute('ms'));
					oldMillisecondsPerBeat = millisecondsPerBeat;
				}
				let table = row.getElementsByTagName('table');
				let isFX = false;
				for (let t = 0; t < table.length; t++)
				if (table[t].hasAttribute('fx'))
				{
					isFX = true;
					let td = table[t].getElementsByTagName('td');
					let gotPart=false
					for (let itd = 0; itd < td.length; itd++)
					if (td[itd].hasAttribute('o'))
					{
						td[itd].addEventListener('click', AutoTableClick);
						if (specialCell==null)
						{
							specialCell = td[itd];
						}
					}
					break;
				}
				row.addEventListener("click", RowClick);
				positionData[index] = new BarData(index,time, bar, beatNo, beatsPerBar, millisecondsPerBeat, beatSize, row,isFX);
				if (bar < minPosValue) minPosValue = bar;
				if (bar > maxPosValue) maxPosValue = bar;
			}
			maxBar = oldBar;
			let color = oldColor;
			let dynamic = oldDynamic;
			if (row.hasAttribute('c'))
			{
				color = row.getAttribute('c');
				row.removeAttribute('c');
				oldColor = color;
			}
			row.style.color = color;
			row.style.backgroundColor = backColor;
			currentRow = row;
			let td = null;
			if (row.hasAttribute('d'))
			{
				dynamic = row.getAttribute('d');
				oldDynamic = dynamic;
			}
			if (dataType!=1)
			{
				td = infoCell.cloneNode(true);
				row.insertAdjacentElement('afterbegin', td);
				let span = td.querySelector('#timeSpan');
				if (isBar) span.innerText = bar + ":" + beatNo;
				else span.innerText = time;
				if (dynamic !== '')
				{
					td.querySelector('#dynSpan').innerText = dynamic;
				}
				if (isBar)
				{
					td.querySelector('#bpb').innerText = beatsPerBar;
					td.querySelector('#bs').innerText = beatSize;
					let sty = changeSig ? "ch" : "nc";
					td.querySelector("#sig").setAttribute(sty, '');
					if (specialCell != null)
					{
						specialCell.style.position = 'relative';
						let span = document.createElement('v1');
						span.className = 'hide';
						span.innerText = bar + ":" + beatNo;
						specialCell.appendChild(span);
					}
				}
			}
		}
		positionData[nRows] = new BarData(nRows, length, maxPosValue + 1, 1, 0, 0, 0, null,false);
		theBegining = positionData[0].Time;
		if (dataType === 1)
		{
			minPosValue = Math.floor(theBegining);
			maxPosValue = Math.floor(length);
		}
		for (let i = 0; i < nRows; i++)
		{
			positionData[i].Duration = positionData[i+1].Time - positionData[i].Time;
		}
	}
	let minPosValue, maxPosValue;
	function Setup()
	{
		FixRows();
		isTouchDeviceOrNoScores = 'ontouchstart' in document.documentElement;
		scoreSrc = document.getElementById("scoreSrc");
		if (scoreSrc == null)
		{
			isTouchDeviceOrNoScores = true;
			scoreSourceAddress = null;
		}
		else scoreSourceAddress = scoreSrc.src;
		if (isTouchDeviceOrNoScores)
		{
			resizerSize = 0;
			if (resizer != null)
			{
				scorePanel.remove();
				resizer.remove();
				resizer = null;
			}
		}
		container = document.getElementById('container');
		FixTable();
		topBar = document.getElementById('topbar');
		topBar.style.userSelect = 'none';
		topBar.style.fontSize = '18pt';
		let style = new Styler();
		style.Add(".button", "color:white;background-color:#202020;width:4em;height:auto;padding:0.6ex 0.2ex 0.6ex 0.2ex;border:1px solid white;cursor:pointer;");
		style.Add(".buttonPlay", "color:white;background-color:#000;width:2em;height:auto;padding:0.1ex;font-size:200%;border-style:none; cursor:pointer");
		style.Add(".buttonUnhide", "color:white;background-color:#400050;width:2em;height:2em;padding:0;border:1px solid white;cursor:pointer;position:fixed;top:0");
		style.Finish();
		unhideDiv = document.getElementById('unhide');
		btnHide = CreateButton('buttonUnhide', "...", "Unhide controls", unhideDiv, ToggleHide);
		unhideDiv.style.width = (btnHide.offsetWidth) + 'px';
		unhideDiv.style.height = (btnHide.offsetHeight) + 'px';
		media = document.createElement('audio');
		document.body.appendChild(media);
		media.src = 'song.mp3';
		barTable = document.getElementById('controls');
		barTable.style.transformOrigin = 'top left';
		barTable.style.whiteSpace = 'nowrap';
		barTable.style.padding = '1px';
		barTable.style.fontSize = '18pt';
		let barCell, innerTable, innerCell;
		let barRow = barTable.insertRow();
		let padding = '0px 0.5ex 0px 0.5ex';
		barCell = barRow.insertCell();
		barCell.style.padding = padding;
		barCell.style.borderRight = '1px solid white';
		innerTable = CreateTable(barCell);
		innerCell = innerTable.insertRow().insertCell();
		innerCell.style.textAlign = 'center';
		CreateCheckbox('lock', 'Prevent Play', 'Check this box to prevent accidental playing. See also "When a row is clicked"', innerCell, TogglePlayButtonLock);
		innerCell = innerTable.insertRow().insertCell();
		btnPlay = CreateButton('buttonPlay', playIcon, 'Play', innerCell, DoPlay);
		btnStop = CreateButton('buttonPlay', stopIcon, 'Stop', innerCell, DoStop);
		if (dataType != 1)
		{
			style.BeginNew();
			style.Add('.com', "font-family:serif;color:yellow;background-color:transparent;width:1em;height:auto;font-size:300%;padding:0 0 0 0.2ex");
			style.Add('.num', "position:relative;top:0.5ex;");
			style.Add('.den', "position:relative;top:-0.5ex;");
			style.Finish();
			innerTable = CreateTable(barRow.insertCell());
			numerator = innerTable.insertRow().insertCell();
			denominator = innerTable.insertRow().insertCell();
			numerator.className = 'com num';
			denominator.className = 'com den';
			numerator.innerText = positionData[0].BeatsPerBar;
			denominator.innerText = positionData[0].BeatSize;
			cellBarNo = barRow.insertCell();
			cellBarNo.style.padding = '0';
			let nc = 1;
			if (maxBar >= 100) nc = 3;
			else if (maxBar >= 10) nc = 2;
			cellBarNo.style.minWidth = nc+'ch';
			cellBarNo.style.fontSize = '250%';
			cellBarNo.style.textAlign = 'right';
			cellBarNo.style.verticalAlign = 'middle';
			cellBarNo.innerHTML = positionData[0].Bar;
			barCell = barRow.insertCell();
			barCell.style.padding = '0';
			barCell.style.fontSize = '250%';
			barCell.style.verticalAlign = 'middle';
			barCell.innerText = ":";
			cellBeatNo = barRow.insertCell();
			cellBeatNo.style.paddingRight = '0.5ex';
			cellBeatNo.style.borderRight = '1px solid white';
			nc = 1;
			if (maxBeatsPerBar >= 10) nc = 2;
			cellBeatNo.style.minWidth = nc+'ch';
			cellBeatNo.style.fontSize = '250%';
			cellBeatNo.style.textAlign = 'left';
			cellBeatNo.style.verticalAlign = 'middle';
			cellBeatNo.innerHTML = "1";
		}
		if (dataType != 1)
		{
			barCell = barRow.insertCell();
			barCell.style.padding = padding;
			barCell.style.borderRight = '1px solid white';
			innerTable = CreateTable(barCell);
			innerCell = innerTable.insertRow().insertCell();
			innerCell.style.textAlign = 'center';
			innerCell.innerText = 'Show/Hide';
			CreateCheckbox('barHide', 'Bar/Sig', 'Check to view Signature and Bar column. Uncheck for more space', innerTable.insertRow().insertCell(), ToggleSignatureColumn).checked = true;
			CreateCheckbox('partHide', 'Part', 'Check to View Parts (S,A,T,B etc.) column. Uncheck for more space', innerTable.insertRow().insertCell(), TogglePartColumn).checked = true;
		}
		barCell = barRow.insertCell();
		barCell.style.padding = padding;
		barCell.style.borderRight = '1px solid white';
		innerTable = CreateTable(barCell);
		innerCell = innerTable.insertRow().insertCell();
		innerCell.innerText = 'When a row is clicked,';
		CreateRadio('nothing', 'RC', 'do nothing', 'When selected, clicking a row will have no effect', innerTable.insertRow().insertCell());
		CreateRadio('play', 'RC', 'play music', 'When selected, the music will start playing at the point where the table is clicked', innerTable.insertRow().insertCell()).checked = true;
		CreateRadio('highlight', 'RC', 'highlight row only', 'When selected, the music will not play but row will be highlighted', innerTable.insertRow().insertCell());
		playHow = 'play';
		barCell = barRow.insertCell();
		barCell.style.padding = padding;
		barCell.style.borderRight = '1px solid white';
		innerTable = CreateTable(barCell);
		rangePos = CreateRange(minPosValue, minPosValue, maxPosValue);
		rangeSpeed = CreateRange(75, 100, 150, 5);
		rangeVol = CreateRange(0, 100, 100);
		let lab = (dataType == 1) ? "Time:" : "Bar:";
		let minWidth = 4.5;
		if (maxPosValue >= 100) minWidth = 6.5;
		elePosition = CreateSpan(lab, rangePos, minPosValue + "/" + maxPosValue, innerTable.insertRow(), minWidth);
		elePlaybackRate = CreateSpan('Speed:', rangeSpeed, "100%", innerTable.insertRow(), minWidth);
		let elePlaybackVolume = CreateSpan('Volume:', rangeVol, "100%", innerTable.insertRow(), minWidth);
		barCell = barRow.insertCell();
		barCell.style.padding = padding;
		barCell.style.borderRight = '1px solid white';
		innerTable = CreateTable(barCell);
		btnInc = CreateButton('button', "A+", 'Increase Font Size', innerTable.insertRow().insertCell(), DoInc);
		btnNorm = CreateButton('button', "100<sup>%</sup>", 'Reset Font Size', innerTable.insertRow().insertCell(), DoNorm);
		btnNorm.style.backgroundColor = "gray";
		btnDec = CreateButton('button', "A-", 'Decrease Font Size', innerTable.insertRow().insertCell(), DoDec);
		barCell = barRow.insertCell();
		barCell.style.padding = padding;
		innerTable = CreateTable(barCell);
		CreateButton('button', 'Index', "Go to Index", innerTable.insertRow().insertCell(), Up1);
		CreateButton('button', 'Home', "Go to Main Index", innerTable.insertRow().insertCell(), Up2);
		controlWidth = barTable.scrollWidth;
		controlHeight = barTable.scrollHeight;
		rangePos.onmouseout = function (ev)
		{
			blnPositioning = false;
			SetPosLabel();
		};
		function OnMouseMove(v,ev)
		{
			blnPositioning = true;
			if ((dataType & 2) != 0 && ev.buttons === 1)
			{
				cellBeatNo.innerText = '1';
				cellBarNo.innerText = v;
			}
			elePosition.innerText = v + "/" + rangePos.max;
		}
		rangePos.onmousemove = function (ev)
		{
			let v = GetPos(rangePos, ev);
			OnMouseMove(v,ev);
		};
		rangePos.ontouchmove = function (ev)
		{
			let v = GetPos(rangePos, ev.touches[0]);
			OnMouseMove(v,ev);
		};
		rangePos.onmouseup = function (ev)
		{
			blnPositioning = false;
			SetMediaPosition(ev);
		};
		rangePos.ontouchend = function (ev)
		{
			blnPositioning = false;
			SetMediaPosition(ev.touches[0]);
		}
		rangeSpeed.oninput = function ()
		{
			let n = Math.floor(this.value / 5) * 5;
			elePlaybackRate.innerText = n + "%";
			media.playbackRate = n / 100;
			this.value = n;
		};
		rangeVol.oninput = function ()
		{
			media.volume = this.value / 100;
			elePlaybackVolume.innerText = this.value + '%';
		};
		if (dataType == 1)
		{
			media.ontimeupdate = function ()
			{
				if (blnPositioning) return;
				SetPosLabel(media.currentTime);
			}
		}
		UnhideBar();
		document.body.addEventListener('dblclick', UnhideBar);
		media.addEventListener('pause', OnPause);
		media.addEventListener('playing', OnResumeOrPlay);
		window.addEventListener('resize',  EnsureCorrectSizes);
		UpdateStatus();
	}
	function Up1()
	{
		window.location.href = '../index.html';
	}
	function Up2()
	{
		window.location.href = '../../index.html';
	}
	function CreateButton(className, text, tooltip, parent, clickEvent)
	{
		let btn = document.createElement('button');
		btn.className = className;
		btn.innerHTML = text;
		btn.title = tooltip;
		btn.data = btn.style.color;
		btn.addEventListener('mouseover', ColorButton);
		btn.addEventListener('mouseout', UncolorButton);
		btn.addEventListener('mousedown', ShiftButton);
		btn.addEventListener('mouseup', ResetTransform)
		btn.addEventListener('touchstart', ShiftButton);
		btn.addEventListener('touchend', ResetTransform);
		btn.addEventListener('click', clickEvent);
		parent.appendChild(btn);
		return btn;
	}
	function ShiftButton(ev)
	{
		ev.target.style.transform = 'translate(1px, 1px)';
	}
	function ColorButton(ev)
	{
		ev.target.data = ev.target.style.color;
		ev.target.style.color = '#FF8080';
	}
	function UncolorButton(ev)
	{
		ev.target.style.color = ev.target.data;
		ResetTransform(ev);
	}
	function ResetTransform(ev)
	{
		ev.target.style.transform = 'translate(0px, 0px)';
		ev.target.style.color = ev.target.data;
	}
	function CreateRange(min, value, max, step = 1)
	{
		let range = document.createElement('input');
		range.type = 'range';
		range.min = min;
		range.step = step;
		range.value = value;
		range.max = max;
		return range;
	}
	function CreateTable(parent)
	{
		let table = document.createElement('table');
		let style = table.style;
		style.border = "0px none black;";
		style.borderCollapse = 'collapse';
		style.padding = '1px';
		style.fontSize = '100%';
		style.color = 'white';
		style.fontSize = '10pt';
		parent.appendChild(table);
		return table;
	}
	function CreateSpan(textLeft, range, textRight, parentRow, minLength)
	{
		let cell = parentRow.insertCell();
		cell.style.textAlign = 'right';
		cell.innerText = textLeft;
		cell.style.verticalAlign = 'middle';
		cell = parentRow.insertCell();
		cell.style.verticalAlign = 'middle';
		cell.appendChild(range);
		cell = parentRow.insertCell();
		cell.style.textAlign = 'right';
		cell.style.verticalAlign = 'middle';
		cell.style.minWidth = minLength + "ch";
		cell.innerText = textRight;
		return cell;
	}
	function CreateRadio(id, name, text, title, parentElement)
	{
		let radio = document.createElement('input');
		radio.type = 'radio';
		radio.id = id;
		radio.name = name;
		radio.checked = false;
		let label = document.createElement('label');
		label.htmlFor = id;
		label.style.color = 'white';
		label.textContent = text;
		label.title = title;
		parentElement.appendChild(radio);
		parentElement.appendChild(label);
		radio.addEventListener('click', RadioClick);
		return radio;
	}
	function RadioClick(event)
	{
		playHow = event.srcElement.id;
		if (playHow === 'play') UnlockPlayOnRowClick();
		else LockPlayOnRowClick();
	}
	function CreateCheckbox(id, text, title, parentElement, clickEvent)
	{
		let checkBox = document.createElement('input');
		checkBox.type = 'checkbox';
		checkBox.id = id;
		checkBox.checked = false;
		let label = document.createElement('label');
		label.htmlFor = id;
		label.style.color = 'white';
		label.style.fontSize = '10pt';
		label.innerHTML = text;
		label.title = title;
		parentElement.appendChild(checkBox);
		parentElement.appendChild(label);
		checkBox.addEventListener('click', clickEvent);
		return checkBox;
	}
	let resizer = document.getElementById('resizer');
	const lyricPanel = document.getElementById('lyricPanel');
	const scorePanel = resizer===null?null:document.getElementById('scorePanel');
	let isInternallyResizing = false;
	let playHow;
	function MoreSetup()
	{
		function CancelInternalResize()
		{
			if (isInternallyResizing)
			{
				isInternallyResizing = false;
				document.body.style.cursor = 'default';
				scoreSrc.style.display = "block";
				resizer.style.backgroundColor = 'dodgerblue';
				EnsureCorrectSizes();
				CheckFontSizes();
			}
		}
		if (resizer != null)
		{
			resizer.onmousedown = function (ev)
			{
				if (ev.buttons != 1) return;
				ResizerStart(ev);
			};
			resizer.ontouchstart = function (ev)
			{
				ResizerStart(ev);
			};
			function ResizerStart(ev)
			{
				isInternallyResizing = false;
				resizer.style.backgroundColor = 'red';
				scoreSrc.style.display = "none";
				document.body.style.cursor = blnLeftToRight ? 'ew-resize' : 'ns-resize';
				isInternallyResizing = true;
			}
			document.ontouchend = function (ev)
			{
				CancelInternalResize();
			}
			document.onmouseup = function (ev)
			{
				CancelInternalResize();
			}
		}
		document.addEventListener('mousemove', (e) =>
		{
			if (!isInternallyResizing) return;
			if (e.buttons != 1)
			{
				CancelInternalResize();
				return;
			}
			DoSizing(e.clientX, e.clientY);
		});
		document.ontouchmove = function (ev)
		{
			if (!isInternallyResizing) return;
			DoSizing(ev.touches[0].clientX, ev.touches[0].clientY);
		};
	}
	function DoSizing(x,y)
	{
		if (blnLeftToRight)
		{
			let newWidthForLyricPanel = x;
			if (container.style.flexDirection === 'row-reverse')
			newWidthForLyricPanel = InnerWidth() - newWidthForLyricPanel;
			lyricPanel.style.flexBasis = newWidthForLyricPanel + 'px';
			lyricPanel.style.width = newWidthForLyricPanel + 'px';
		}
		else
		{
			let newHeightForLyricPanel = y;
			if (container.style.flexDirection === 'column-reverse')
			newHeightForLyricPanel = InnerHeight() - newHeightForLyricPanel;
			if (blnBarVisible) newHeightForLyricPanel -= topBar.clientHeight;
			lyricPanel.style.flexBasis = newHeightForLyricPanel + 'px';
			lyricPanel.style.height = newHeightForLyricPanel + 'px';
		}
		EnsureCorrectSizes();
	}
	function ShowScore()
	{
		window.open(scoreSourceAddress, 'TheScores');
	}
	function Swap()
	{
		let dir = container.style.flexDirection;
		if (dir === 'row') dir = 'row-reverse';
		else if (dir === 'row-reverse') dir = 'row';
		else if (dir === 'column') dir = 'column-reverse';
		else dir = 'column';
		container.style.flexDirection = dir;
	}
	let blnLeftToRight = true;
	function SetHorizontalLayout()
	{
		blnLeftToRight = true;
		container.style.flexDirection = 'row';
		let avail = container.offsetWidth - resizerSize;
		let w = avail + 'px';
		if (resizerSize > 0)
		{
			resizer.style.height = '100%';
			resizer.style.width = resizerSize + 'px';
			resizer.style.cursor = 'ew-resize';
			w = (avail / 2) + 'px';
			scorePanel.style.flexBasis = w;
			scorePanel.style.width = w;
		}
		lyricPanel.style.flexBasis = w;
		lyricPanel.style.width = w;
		EnsureCorrectSizes();
	}
	function SetVerticalLayout()
	{
		blnLeftToRight = false;
		if (resizer === null) return;
		container.style.flexDirection = 'column';
		resizer.style.width = '100%';
		resizer.style.height = resizerSize+'px';
		resizer.style.cursor = 'ns-resize';
		let avail = container.offsetHeight - resizerSize;
		let h = (avail / 2) + 'px';
		lyricPanel.style.flexBasis = h;
		lyricPanel.style.height = h;
		scorePanel.style.flexBasis = h;
		scorePanel.style.height = h;
		EnsureCorrectSizes();
	}
	function ChangeOrientation()
	{
		if (blnLeftToRight) SetVerticalLayout();
		else SetHorizontalLayout();
	}
	let waitAbit;
	function DoResize()
	{
		FixTopBar();
		clearTimeout(waitAbit);
		waitAbit=setTimeout(CheckFontSizes, 500);
	}
	function FixTopBar()
	{
		let scale = 1;
		barTable.style.transform = 'none';
		barTable.style.transformOrigin = 'top left';
		let ratio = controlHeight / window.innerHeight;
		const maxRat = 0.1;
		if (ratio > maxRat) scale = maxRat / ratio;
		if (scale * controlHeight < 50) scale = 50 / controlHeight;
		container.style.width = window.innerWidth + "px";
		container.style.height = InnerHeight() + "px";
		if (controlWidth > window.innerWidth)
		{
			let test = window.innerWidth / controlWidth;
			if (test < scale) scale = test;
		}
		let w = (window.innerWidth - scale * controlWidth)/2;
		barTable.style.transform = 'scale(' + scale + ') translateX(' + w + 'px)';
		let rect = barTable.getBoundingClientRect();
		let pad = 2;
		topBar.style.paddingTop = pad + "px";
		barThickness = rect.height +2*pad;
		topBar.style.height = barThickness + "px";
		EnsureCorrectSizes();
	}
	let isPaused= false;
	function BeforePrint()
	{
		isPaused = media.paused;
		media.pause();
		UnhighlightRow();
		StopMonitor();
		CheckFontSizes();
	}
	function AfterPrint()
	{
		if (!isPaused) media.play();
	}
	function DoItAll()
	{
		if (allOK === false || allOK === null)
		{
			document.getElementById('container').style.display = 'none';
			document.write("<span color='red'>Too Many Login Attempts</span>");
			return;
		}
		Setup();
		if (!isTouchDeviceOrNoScores) MoreSetup();
		container.style.display = 'flex';
		SetHorizontalLayout();
		window.addEventListener("beforeprint", BeforePrint);
		window.addEventListener("afterprint", AfterPrint);
		window.addEventListener('resize', DoResize);
		FixTopBar();
		setTimeout(CheckFontSizes,250);
	}
	setTimeout(DoItAll, 0);
