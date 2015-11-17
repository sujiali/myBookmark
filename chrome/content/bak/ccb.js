function myTempOnpop(e) {
	console.log("111111");
	var menupopup = e.target;
	// clear previous
	while (menupopup.firstChild) {
		menupopup.removeChild(menupopup.firstChild);
	}
	// new instance
	var my = document.getElementById('myTempContextmenu');
	// add bookmarks
	var menuitemElem = document.createElement('menuitem');
	menuitemElem.setAttribute('label', 'abc');
	menuitemElem.setAttribute('id', 'myabc');
	menuitemElem.setAttribute('class',
			'menuitem-iconic  bookmark-item subviewbutton');
	my.appendChild(menuitemElem);
	var myabc = document.getElementById('myabc');
	myabc.addEventListener('command', function(aEvent) {
				console.log("2222222")
				alert('Box was pressed!');
			}, true);
	e.stopPropagation();
}
