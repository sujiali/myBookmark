// 预定义对象
var Cc = Components.classes;
var Ci = Components.interfaces;
var bkService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
		.getService(Ci.nsINavBookmarksService);
var htService = Cc["@mozilla.org/browser/nav-history-service;1"]
		.getService(Ci.nsINavHistoryService);
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var win = Cc["@mozilla.org/appshell/window-mediator;1"]
		.getService(Ci.nsIWindowMediator)
		.getMostRecentWindow("navigator:browser");

// Temp Menu Popup event
function myTempOnpop(event) {
	// get parent tree
	var menupopup = event.target;
	// clear previous
	while (menupopup.firstChild) {
		menupopup.removeChild(menupopup.firstChild);
	}
	// new instance
	var my = document.getElementById('myTempContextmenu');

	// add bookmarks
	var BookmarksInTemp = myGetBookmarksForTemp();
	for (var i = 0; i < BookmarksInTemp.length; i++) {
		var menuitemElem = document.createElement('menuitem');
		var myDate = myGetTime(bkService.getItemDateAdded(BookmarksInTemp[i]));
		menuitemElem.setAttribute('label', myDate + " "
						+ bkService.getItemTitle(BookmarksInTemp[i]));
		menuitemElem.setAttribute('class',
				'menuitem-iconic  bookmark-item subviewbutton');
		var myURI = bkService.getBookmarkURI(BookmarksInTemp[i]);
//		menuitemElem.setAttribute('oncommand', 'openUILinkIn("' + myURI.spec
//						+ '", "tab"); event.stopPropagation();');
		
		menuitemElem.setAttribute('context', 'myBookmarkContextmenu');
		menuitemElem.setAttribute('bmt-bmid', BookmarksInTemp[i]);
		my.appendChild(menuitemElem);
	}

	// var CloneNode0 =
	// document.getElementById('BMB_bookmarksShowAll').cloneNode(true);
	// CloneNode0.setAttribute("id", "myAddBookmark1");
	// my.appendChild(CloneNode0);

	// stop propagation
	event.stopPropagation();
	return true;
}

// 添加书签到未分类文件夹
function myAddBookmarkToUnsorted() {
	folder = bkService.unfiledBookmarksFolder; // Unsorted Bookmarks
	var myBrowser = win.gBrowser;
	var currentBrowser = (myBrowser.browsers.length > 1)
			? myBrowser.selectedBrowser
			: myBrowser;
	var webNavigation = currentBrowser.webNavigation;
	var url = webNavigation.currentURI.spec;
	var name = '';
	try {
		var doc = webNavigation.document;
		name = doc.title || url;
	} catch (e) {
		name = url;
	}
	name = name.replace(/[\/]/g, "-");
	name = name.replace(/[\\:*?\"<>|]/g, " ");
	var uri = ios.newURI(url, null, null);
	var newBkmkId = bkService.insertBookmark(folder, uri,
			bkService.DEFAULT_INDEX, name);
	alert('You have added \"' + name + '\" in Unsorted Bookmarks Folder.');
}

// 获取未分类文件夹下的书签
function myGetBookmarksForTemp() {
	folder = bkService.unfiledBookmarksFolder; // Unsorted Bookmarks
	var rBookmarks = new Array();
	var query = htService.getNewQuery();
	query.setFolders([folder], 1);
	var htOptions = htService.getNewQueryOptions();
	htOptions.sortingMode = Ci.nsINavHistoryQueryOptions.SORT_BY_DATEADDED_DESCENDING; // 按时间降序排列
	var result = htService.executeQuery(query, htOptions);
	var folderNode = result.root;
	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; i++) {
		if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
			rBookmarks.push(folderNode.getChild(i).itemId);
		}
	}
	folderNode.containerOpen = false;
	return rBookmarks;
}

// 编辑属性
function myEditProperties() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	PlacesUIUtils.showBookmarkDialog({
				action : "edit",
				type : "bookmark",
				itemId : id
			}, window);
}

// 删除书签
function myRemoveBookmark() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	PlacesUtils.bookmarks.removeItem(id);
}

// 获得2010-09-04样式的日期
function myGetTime(myTime) {
	myDate = new Date(myTime / 1000);
	return myDate.getFullYear() + "-"
			+ myTrimTime((myDate.getMonth() + 1).toString()) + "-"
			+ myTrimTime(myDate.getDate().toString());
}

// 单日期前加零
function myTrimTime(s) {
	if (s.length == 1) {
		return "0" + s;
	} else {
		return s;
	}
}
