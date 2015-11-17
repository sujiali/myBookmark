// 预定义对象
// *****************************************************************************************************

var Cc = Components.classes;
var Ci = Components.interfaces;
var bkService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
var htService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var win = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");

// *****************************************************************************************************
// 主函数
// *****************************************************************************************************

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
	// add temp general menuitem
	var CloneNode0 = document.getElementById('myAddBookmark').cloneNode(true);
	CloneNode0.setAttribute("id", "myAddBookmark1");
	my.appendChild(CloneNode0);
	// add a separator
	var menuseparatorElem = document.createElement('menuseparator');
	my.appendChild(menuseparatorElem);
	// add bookmarks
	var BookmarksInTemp = myGetBookmarksForTemp();
	for (var i = 0; i < BookmarksInTemp.length; i++) {
		var menuitemElem = document.createElement('menuitem');
		var myDate = myGetTime(bkService.getItemDateAdded(BookmarksInTemp[i]));
		menuitemElem.setAttribute('label', myDate + " " + bkService.getItemTitle(BookmarksInTemp[i]));
		menuitemElem.setAttribute('class', 'menuitem-iconic bookmark-item');
		var myURI = bkService.getBookmarkURI(BookmarksInTemp[i]);
		menuitemElem.setAttribute('oncommand', 'openUILinkIn("' + myURI.spec + '", "tab")');
		// menuitemElem.setAttribute('context', 'myBookmarkContextmenu');
		menuitemElem.setAttribute('bmt-bmid', BookmarksInTemp[i]);
		my.appendChild(menuitemElem);
	}
	// stop propagation
	event.stopPropagation();
	return true;
}

// Convert bookmark to html
function myConvertBKToJson() {
	var s = 'var setting = {}; var zNodes ='
	// var s = '';
	s = s + JSON.stringify(myGetAllBookmarks(bkService.bookmarksMenuFolder));
	// s=s+';';
	// save file;
	// save("D:\\wwwroot\\zTree\\myBookmarks\\bookmarks.json", s);
	save("D:\\wwwroot\\zTree\\myBookmarks\\bookmarks.js", s);
	alert('Converting bookmarks to Json data has done!');
}

// *****************************************************************************************************
// 调用的函数
// *****************************************************************************************************

// 获得子文件夹id
function myGetChildFolder(aFolder, aSubFolder) {
	var aSubFolderId = 0;

	var query = htService.getNewQuery();
	query.setFolders([aFolder], 1);
	var htOptions = htService.getNewQueryOptions();
	var result = htService.executeQuery(query, htOptions);
	var folderNode = result.root;
	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; i++) {
		if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER && folderNode.getChild(i).title == aSubFolder) {
			aSubFolderId = folderNode.getChild(i).itemId;
			break;
		}
	}
	folderNode.containerOpen = false;
	return aSubFolderId;
}

// 获取Temp文件夹下的书签
function myGetBookmarksForTemp() {
	var TempFolder = myGetChildFolder(bkService.bookmarksMenuFolder, 'Temp');
	var rBookmarks = new Array();

	var query = htService.getNewQuery();
	query.setFolders([TempFolder], 1);
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

// 获取所有书签
function myGetAllBookmarks(aFolder) {
	var rBookmarks = new Array();
	var bkURIs = new Array();
	var bkFolders = new Array();

	var query = htService.getNewQuery();
	query.setFolders([aFolder], 1);
	var htOptions = htService.getNewQueryOptions();
	htOptions.sortingMode = Ci.nsINavHistoryQueryOptions.SORT_BY_TITLE_ASCENDING; // 按名称升序排列
	var result = htService.executeQuery(query, htOptions);
	var folderNode = result.root;
	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; i++) {
		if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
			var bkURI = {};
			bkURI.name = folderNode.getChild(i).title;
			bkURI.url = folderNode.getChild(i).uri;
			bkURIs.push(bkURI);
		} else if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
			var bkFolder = {};
			bkFolder.name = folderNode.getChild(i).title;
			bkFolder.children = myGetAllBookmarks(folderNode.getChild(i).itemId);
			bkFolders.push(bkFolder);
		}
	}
	rBookmarks = bkFolders.concat(bkURIs);
	folderNode.containerOpen = false;
	return rBookmarks;
}

// 添加书签到指定文件夹
function myAddBookmarkToTemp() {
	var TempFolder = myGetChildFolder(bkService.bookmarksMenuFolder, 'Temp');
	var myBrowser = win.gBrowser;
	var currentBrowser = (myBrowser.browsers.length > 1) ? myBrowser.selectedBrowser : myBrowser;
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
	var newBkmkId = bkService.insertBookmark(TempFolder, uri, bkService.DEFAULT_INDEX, name);
	alert('You have added \"' + name + '\" in Temp.');
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
	return myDate.getFullYear() + "-" + myTrimTime((myDate.getMonth() + 1).toString()) + "-" + myTrimTime(myDate.getDate().toString());
}

// 单日期前加零
function myTrimTime(s) {
	if (s.length == 1) {
		return "0" + s;
	} else {
		return s;
	}
}

// 写入文件
function save(path, content) {
	var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	file.initWithPath(path);
	if (file.exists() == false) {
		file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 420);
	}
	var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);
	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	converter.charset = 'UTF-8';
	var convSource = converter.ConvertFromUnicode(content);
	var result = outputStream.write(convSource, convSource.length);
	outputStream.close();
}
