var mybmb = document.getElementById("bookmarks-menu-button");
mybmb.removeAttribute('ondragenter');
mybmb.removeAttribute('ondragover');
mybmb.removeAttribute('ondragleave');
mybmb.removeAttribute('ondrop');
mybmb.removeChild(document.getElementById('BMB_bookmarksPopup'));
var mymenupopup = document.createElement("menupopup");
mymenupopup.setAttribute('id', "myTempContextmenu");
mymenupopup.setAttribute('placespopup', 'true');
mymenupopup
		.setAttribute(
				'class',
				"cui-widget-panel cui-widget-panelview cui-widget-panelWithFooter PanelUI-subView");
mymenupopup.setAttribute('openInTabs', 'children');
mymenupopup.setAttribute('context', 'placesContext');
mymenupopup.addEventListener("popupshowing", function(event) {
			if (!this.parentNode._placesView) {
				new window.PlacesMenu(event,
						'place:folder=UNFILED_BOOKMARKS&sort=12');
			}
		});
mymenupopup.addEventListener("command", function(event) {
			window.BookmarksEventHandler.onCommand(event,
					this.parentNode._placesView);
		});
mymenupopup.addEventListener("click", function(event) {
			window.BookmarksEventHandler.onClick(event,
					this.parentNode._placesView);
		});
mybmb.appendChild(mymenupopup);
