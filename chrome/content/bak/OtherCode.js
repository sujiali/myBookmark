// 获取文件夹下的书签
function myGetBookmarksforFolder(aFolder) {
	var rBookmarks = new Array();

	var query = htService.getNewQuery();
	query.setFolders([aFolder], 1);
	var htOptions = htService.getNewQueryOptions();
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

// 添加书签到指定文件夹
function myAddBookmark(aFolder) {
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
	var newBkmkId = bkService.insertBookmark(aFolder, uri, bkService.DEFAULT_INDEX, name);
	alert('You have added \"' + name + '\" in Temp.');
}

// var menuitemElem = document.createElement('menuitem');
// menuitemElem.setAttribute('label', 'Export Bookmark to IE');
// menuitemElem.setAttribute('oncommand', 'myConvertBKtoIE()');
// my.appendChild(menuitemElem);