// 预定义对象
// *****************************************************************************************************
var Cc = Components.classes;
var Ci = Components.interfaces;

var navBookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
		.getService(Ci.nsINavBookmarksService);
var htService = Cc["@mozilla.org/browser/nav-history-service;1"]
		.getService(Ci.nsINavHistoryService);
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var win = Cc["@mozilla.org/appshell/window-mediator;1"]
		.getService(Ci.nsIWindowMediator)
		.getMostRecentWindow("navigator:browser");

var TempFolder = getChildFolder(navBookmarksService.bookmarksMenuFolder, 'Temp');

// *****************************************************************************************************

// 主函数
// *****************************************************************************************************

// Temp Menu Popup event
function MyTempOnpop(event) {

	// get parent tree
	var menupopup = event.target;

	// clear previous
	while (menupopup.firstChild) {
		menupopup.removeChild(menupopup.firstChild);
	}

	var my = document.getElementById('MyTempContextmenu');

	// add temp general menuitem
	var menuitemElem = document.createElement('menuitem');
	menuitemElem.setAttribute('label', 'Bookmark This Page to Temp');
	menuitemElem.setAttribute('oncommand', 'myAddBookmark(TempFolder)');
	my.appendChild(menuitemElem);
	var menuitemElem = document.createElement('menuitem');
	menuitemElem.setAttribute('label', 'Export Bookmark to IE');
	menuitemElem.setAttribute('oncommand', 'ConvertBKtoIE()');
	my.appendChild(menuitemElem);
	// add a separator
	var menuseparatorElem = document.createElement('menuseparator');
	my.appendChild(menuseparatorElem);

	// add bookmarks in Temp
	var BookmarksInTemp = getBookmarksforFolder(TempFolder);
	for (var i = 0; i < BookmarksInTemp.length; i++) {
		var menuitemElem = document.createElement('menuitem');
		var myDate = myGetTime(navBookmarksService
				.getItemDateAdded(BookmarksInTemp[i]));
		menuitemElem.setAttribute('label', myDate + " "
						+ navBookmarksService.getItemTitle(BookmarksInTemp[i]));
		menuitemElem.setAttribute('class', 'menuitem-iconic bookmark-item');
		var myURI = navBookmarksService.getBookmarkURI(BookmarksInTemp[i]);
		menuitemElem.setAttribute('oncommand', 'openUILinkIn("' + myURI.spec
						+ '", "tab")');
		menuitemElem.setAttribute('context', 'myBookmarkContextmenu');
		menuitemElem.setAttribute('bmt-bmid', BookmarksInTemp[i]);
		my.appendChild(menuitemElem);
	}

	// stop propagation
	event.stopPropagation();
	return true;

}
// *****************************************************************************************************

// Convert bookmark to html
function ConvertBKtoIE() {
	var s = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Firefox Bookmarks</title><link rel="stylesheet" href="../jquery.treeview.css" /><link rel="stylesheet" href="../red-treeview.css" /><link rel="stylesheet" href="screen.css" /><script src="../lib/jquery.js" type="text/javascript"></script><script src="../lib/jquery.cookie.js" type="text/javascript"></script><script src="../jquery.treeview.js" type="text/javascript"></script><script src="myExtra.js" type="text/javascript"></script></head><body class="font1"><div id="main">  <div id="sidetree"><div class="treeheader">My Bookmarks</div><div id="sidetreecontrol"> <a href="?#">Collapse All</a> | <a href="?#">Expand All</a> </div><ul class="treeview" id="tree">'
	s = s+getAllBookmarks(navBookmarksService.bookmarksMenuFolder);
	s = s + '</ul></div></div></body></html>'
	// save file
	save("D:\\wwwroot\\Bookmarks\\demo\\main.htm", s);
	alert('Converting Bookmarks to html has done!')
}

// 调用的函数
// *****************************************************************************************************

// 获得子文件夹id
function getChildFolder(aFolder, aSubFolder) {
	var query = htService.getNewQuery();
	var options = htService.getNewQueryOptions();
	query.setFolders([aFolder], 1);
	var result = htService.executeQuery(query, options);
	var rootNode = result.root;
	var childFolder = 0;
	rootNode.containerOpen = true;
	for (var i = 0; i < rootNode.childCount; i++) {
		var node = rootNode.getChild(i);
		if (node.type == node.RESULT_TYPE_FOLDER && node.title == aSubFolder) {
			childFolder = node.itemId;
			break;
		}
	}
	rootNode.containerOpen = false;
	return childFolder;
}

// 添加书签到指定文件夹
function myAddBookmark(aFolder) {
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
	var newBkmkId = navBookmarksService.insertBookmark(aFolder, uri,
			navBookmarksService.DEFAULT_INDEX, name);
	alert('You have added \"' + name + '\" in Temp.');
}


// 根据文件夹获取书签
function getBookmarksforFolder(aFolder) {
	var query = htService.getNewQuery();
	query.setFolders([aFolder], 1);
	var historyOptions = htService.getNewQueryOptions();
	// historyOptions.sortingAnnotation = 'getBookmarksforFolder';
	historyOptions.sortingMode = 12; // 降序排列
	var result = htService.executeQuery(query, historyOptions);
	// The root property of a query result is an object representing the folder
	// you specified above.
	var folderNode = result.root;
	var rBookmarks = new Array();
	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; ++i) {
		var childNode = folderNode.getChild(i);
		if (childNode.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
			rBookmarks.push(childNode.itemId);
		}
	}
	folderNode.containerOpen = false;
	return rBookmarks;
}


// 获取所有书签并导出
function getAllBookmarks(aFolder) {
	var s = '';
	var idxURI = new Array();
	var idxFolder = new Array();
	var query = htService.getNewQuery();
	query.setFolders([aFolder], 1);
	var historyOptions = htService.getNewQueryOptions();
	// historyOptions.sortingAnnotation = 'getAllBookmarks';
	historyOptions.sortingMode = 1; // 升序排列
	var result = htService.executeQuery(query, historyOptions);
	var folderNode = result.root;
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; ++i) {

		if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
			idxURI.push(i);
		} else if (folderNode.getChild(i).type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
			idxFolder.push(i);
		}
	}

	// var childNode = folderNode.getChild(i);
	// var title = childNode.title;
	// var id = childNode.itemId;
	// var type = childNode.type;
	// var uri = childNode.uri;

	for (var i = 0; i < idxFolder.length; i++) {
		if ((i == idxFolder.length - 1) && (idxURI.length == 0)) {
			s = s
					+ '<li class="expandable lastExpandable"><div class="hitarea expandable-hitarea lastExpandable-hitarea"></div><img width="16" height="14" src="../images/folder.gif"><span><strong>'
					+ folderNode.getChild(idxFolder[i]).title
					+ '</strong></span><ul style="display: none;">';;
			s = s
					+ getAllBookmarks(folderNode
							.getChild(idxFolder[i]).itemId);
			s = s + '</ul></li>'
		} else {
			s = s
					+ '<li class="expandable"><div class="hitarea expandable-hitarea"></div><img width="16" height="14" src="../images/folder.gif"><span><strong>'
					+ folderNode.getChild(idxFolder[i]).title
					+ '</strong></span><ul style="display: none;">';;
			s = s + getAllBookmarks(folderNode.getChild(idxFolder[i]).itemId);
			s = s + '</ul></li>'
		}
	}

	if (idxURI.length > 0) {
		for (var i = 0; i < idxURI.length - 1; ++i) {
			s = s + '<li><span class="file"><img width="15" height="14" src="../images/file.gif"><a href='
					+ folderNode.getChild(idxURI[i]).uri + ' target="_blank">'
					+ folderNode.getChild(idxURI[i]).title + '</a></span></li>';
		}
		s = s + '<li  class="last"><span class="file"><img width="15" height="14" src="../images/file.gif"><a href='
				+ folderNode.getChild(idxURI[idxURI.length - 1]).uri
				+ ' target="_blank">'
				+ folderNode.getChild(idxURI[idxURI.length - 1]).title
				+ '</a></span></li>';
	}

	folderNode.containerOpen = false;
	return s;
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

// 编辑属性
function myEditProperties() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	PlacesUIUtils.showItemProperties(id, "bookmark");
}

// 删除书签
function myRemoveBookmark() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	PlacesUtils.bookmarks.removeItem(id);
}

// 写入文件
function save(path, content) {
	try {
		netscape.security.PrivilegeManager
				.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	if (file.exists() == false) {
		// alert( "Creating file... " );
		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
	}
	var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);

	outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);

	var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	converter.charset = 'UTF-8';

	var convSource = converter.ConvertFromUnicode(content);
	var result = outputStream.write(convSource, convSource.length);
	outputStream.close();
}
