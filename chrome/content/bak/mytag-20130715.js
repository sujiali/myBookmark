// 预定义对象
// *****************************************************************************************************
var navBookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
		.getService(Components.interfaces.nsINavBookmarksService);
var ios = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
var htService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
			.getService(Components.interfaces.nsINavHistoryService);
// *****************************************************************************************************
var menuFolder = navBookmarksService.bookmarksMenuFolder; // Bookmarks menu
// folder
var uri = ios.newURI("http://google.com/sdsfdf", null, null);
var newBkmkId = navBookmarksService.insertBookmark(getChildFolder(menuFolder,
				"temp"), uri, navBookmarksService.DEFAULT_INDEX, "google 的地址");

// 获得子文件夹
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

// 添加书签
function myAddBookmarkToTemp() {
	var myBrowser = win.gBrowser
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
	var idoftemp = getChildFolder(navBookmarksService.bookmarksMenuFolder,
			'Temp')
	var newBkmkId = navBookmarksService.insertBookmark(idoftemp, uri,
			navBookmarksService.DEFAULT_INDEX, name);
	alert('You add \"' + name + '\"');
}




// 主函数
// *****************************************************************************************************

// temp event
function MyTempOnpop(event) {

	var idoftemp = getChildFolder(navBookmarksService.bookmarksMenuFolder,
			'Temp')
	var historyOptions = htService.getNewQueryOptions()
	historyOptions.sortingAnnotation = 'abc';
	historyOptions.sortingMode = 12;
	var query = htService.getNewQuery();
	query.setFolders([idoftemp], 1);
	var result = htService.executeQuery(query, historyOptions);
	// The root property of a query result is an object representing the folder you
	// specified above.
	var folderNode = result.root;
	var NameAndUrl = new Array();
	var tempStr;

	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i = 0; i < folderNode.childCount; ++i) {
		var childNode = folderNode.getChild(i);
		// Some type-specific actions.
		// if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
		var title = childNode.title;
		tempStr = "<date>" + childNode.dateAdded + "</date><name>"
				+ childNode.title + "</name><url>" + childNode.uri
				+ "</url><id>" + childNode.itemId + "</id>";
		NameAndUrl.push(tempStr)
	}

	folderNode.containerOpen = false;

	//alert(NameAndUrl);
	
	// get parent
	var menupopup = event.target;
	// clear previous
	while (menupopup.firstChild) {
		menupopup.removeChild(menupopup.firstChild);
	}

	var my = document.getElementById('MyTempContextmenu')

	// add temp general menuitem
	var menuitemElem = document.createElement('menuitem');
	menuitemElem.setAttribute('label', 'Bookmark This Page to temp');
	menuitemElem.setAttribute('oncommand', 'myAddBookmarkToTemp()');
	my.appendChild(menuitemElem);
	var menuseparatorElem = document.createElement('menuseparator')
	my.appendChild(menuseparatorElem);


	for (var i = 0; i < NameAndUrl.length-1; i++) {
		var menuitemElem = document.createElement('menuitem');
		var myDate = myGetTime(fd(NameAndUrl[i]))
		menuitemElem.setAttribute('label', myDate + " " + fn(NameAndUrl[i]));
		menuitemElem.setAttribute('class', 'menuitem-iconic bookmark-item');
		menuitemElem.setAttribute('oncommand', 'openUILinkIn("'+ fu(NameAndUrl[i]) + '", "tab")');
		menuitemElem.setAttribute('context', 'mybookmark-CM');
		menuitemElem.setAttribute('bmt-bmid', fid(NameAndUrl[i]));
		my.appendChild(menuitemElem);
	}
	

	// stop propagation
	event.stopPropagation();
	return true;

}

// Convert bookmark to html
function ConvertBKtoIE() {
	// start html
	var mytag = "mytags"; // 一级书签所在菜单tag
	var s = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>空白页</title><link rel="stylesheet" href="../jquery.treeview.css" /><link rel="stylesheet" href="../red-treeview.css" /><link rel="stylesheet" href="screen.css" /><script src="../lib/jquery.js" type="text/javascript"></script><script src="../lib/jquery.cookie.js" type="text/javascript"></script><script src="../jquery.treeview.js" type="text/javascript"></script><script src="myExtra.js" type="text/javascript"></script></head><body class="font1"><div id="main">  <div id="sidetree"><div class="treeheader">My Bookmarks</div><div id="sidetreecontrol"> <a href="?#">Collapse All</a> | <a href="?#">Expand All</a> </div><ul class="treeview" id="tree">'
	var tagArray = taggingSvc.allTags
	for (var j = 0; j < tagArray.length; j++) {
		var pos = tagArray[j].lastIndexOf(".");
		if ((pos == -1) && (tagArray[j] != mytag) && (tagArray[j] != 'locked')
				&& (tagArray[j] != 'protected')) { // 排除一级书签所在菜单mytags，还有locked，protected等
			s = s
					+ '<li class="expandable"><div class="hitarea expandable-hitarea"></div><span><strong>'
					+ tagArray[j]
					+ '</strong></span><ul style="display: none;">'

			// start of iterating
			s = s + myIterate(tagArray[j])
			// end of iterating

			// start of adding bookmarks of 'tagArray[j]'
			var uris = taggingSvc.getURIsForTag(tagArray[j]);
			var myid, tempStr
			var NameAndUrl = new Array();
			for (var i = 0; i < uris.length; i++) {
				myid = getRealID(uris[i])
				tempStr = "<name>" + navBookmarksService.getItemTitle(myid)
						+ "</name><url>" + uris[i].spec + "</url>"
				NameAndUrl.push(tempStr)
			}
			NameAndUrl.sort(myCompare)
			for (var i = 0; i < uris.length; i++) {
				if (i == uris.length - 1) {
					s = s + '<li class="last"><a href="' + fu(NameAndUrl[i])
							+ '" target="_blank">' + fn(NameAndUrl[i])
							+ '</a></li>'
				} else {
					s = s + '<li><a href="' + fu(NameAndUrl[i])
							+ '" target="_blank">' + fn(NameAndUrl[i])
							+ '</a></li>'
				}
			}
			// end of adding bookmarks of 'tagArray[j]'

			s = s + '</ul></li>'
		}
	}

	// start of adding level_1 bookmarks
	var uris = taggingSvc.getURIsForTag(mytag);
	var myid, tempStr
	var NameAndUrl = new Array();
	for (var i = 0; i < uris.length; i++) {
		myid = getRealID(uris[i])
		tempStr = "<name>" + navBookmarksService.getItemTitle(myid)
				+ "</name><url>" + uris[i].spec + "</url>"
		NameAndUrl.push(tempStr)
	}
	NameAndUrl.sort(myCompare)
	for (var i = 0; i < uris.length; i++) {
		if (i == uris.length - 1) {
			s = s + '<li class="last"><span class="file"><a href='
					+ fu(NameAndUrl[i]) + ' target="_blank">'
					+ fn(NameAndUrl[i]) + '</a></span></li>'
		} else {
			s = s + '<li><span class="file"><a href=' + fu(NameAndUrl[i])
					+ ' target="_blank">' + fn(NameAndUrl[i])
					+ '</a></span></li>'
		}
	}
	// end of adding bookmarks of 'top'

	// end html
	s = s + '</ul></div></div></body></html>'

	// save file
	save("D:\\wwwroot\\Bookmarks\\demo\\main.htm", s);
	alert('Converting Bookmarks to html has done!')
}

// *****************************************************************************************************

// 调用的函数
// *****************************************************************************************************

// 正则表达式取出<name>标签
function fn(str) {
	var r
	var re = new RegExp(/<name>(.*(?=<\/name>))/);
	r = str.match(re)
	return r[1]
}

// 正则表达式取出<url>标签
function fu(str) {
	var r
	var re = new RegExp(/<url>(.*(?=<\/url>))/);
	r = str.match(re)
	return r[1]
}

// 正则表达式取出<id>标签
function fid(str) {
	var r
	var re = new RegExp(/<id>(.*(?=<\/id>))/);
	r = str.match(re)
	return r[1]
}

// 正则表达式取出<date>标签
function fd(str) {
	var r
	var re = new RegExp(/<date>(.*(?=<\/date>))/);
	r = str.match(re)
	return r[1]
}

// 字符串数组排序
function myCompare(s1, s2) {
	var a, b
	a = fn(s1);
	b = fn(s2);
	if (a.localeCompare(b) < 0)
		return -1;
	if (a.localeCompare(b) > 0)
		return 1;
	if (a.localeCompare(b) == 0)
		return 0;
}

// 时间数组排序
function myCompareTime(s1, s2) {
	var a, b
	a = fd(s1);
	b = fd(s2);
	if (a.localeCompare(b) > 0)
		return -1;
	if (a.localeCompare(b) < 0)
		return 1;
	if (a.localeCompare(b) == 0)
		return 0;
}

// 获得2010-09-04样式的日期
function myGetTime(myPRTime) {
	myDate = new Date(myPRTime / 1000)
	return myDate.getFullYear() + "-"
			+ myTrimTime((myDate.getMonth() + 1).toString()) + "-"
			+ myTrimTime(myDate.getDate().toString())
}

// 单日期前加零
function myTrimTime(s) {
	if (s.length == 1) {
		return "0" + s
	} else {
		return s
	}
}

// 设置为近期焦点
function myAddToFocus() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	var uri = navBookmarksService.getBookmarkURI(id)
	taggingSvc.tagURI(uri, ["focus"]);
}

// 取消设置为近期焦点
function myRemoveFromFocus() {
	var popupElem = document.popupNode;
	var id = parseInt(popupElem.getAttribute("bmt-bmid"));
	var uri = navBookmarksService.getBookmarkURI(id)
	taggingSvc.untagURI(uri, ["focus"]);
}

// 获得URI的真实ID
function getRealID(uri) {
	var bookmarksArray = navBookmarksService.getBookmarkIdsForURI(uri, {});
	var i = 0;
	while (navBookmarksService.getItemTitle(bookmarksArray[i]) == null) {
		i++
	}
	return bookmarksArray[i]
}

// *****************************************************************************************************

function myIterate(myIterateParent) {
	var myIterateS = ''
	var myIterateTagarray = taggingSvc.allTags
	for (var n = 0; n < myIterateTagarray.length; n++) {
		var myIteratePos = myIterateTagarray[n].lastIndexOf(".");
		var myIteratePre = myIterateTagarray[n].slice(0, myIteratePos)
		var myIterateFlw = myIterateTagarray[n].slice(myIteratePos + 1,
				myIterateTagarray[n].length)
		if ((myIteratePos != -1) && (myIteratePre == myIterateParent)) {
			myIterateS = myIterateS
					+ '<li class="expandable"><div class="hitarea expandable-hitarea"></div><span><strong>'
					+ myIterateFlw
					+ '</strong></span><ul style="display: none;">'

			// start of iterating
			myIterateS = myIterateS + myIterate(myIterateTagarray[n])
			// end of iterating

			// start of adding bookmarks of 'myIterateTagarray[n]'
			var myIterateUris = taggingSvc.getURIsForTag(myIterateTagarray[n]);
			var myIterateId, tempStr
			var NameAndUrl = new Array();
			for (var i = 0; i < myIterateUris.length; i++) {
				myIterateId = getRealID(myIterateUris[i])
				tempStr = "<name>"
						+ navBookmarksService.getItemTitle(myIterateId)
						+ "</name><url>" + myIterateUris[i].spec + "</url>"
				NameAndUrl.push(tempStr)
			}
			NameAndUrl.sort(myCompare)
			for (var i = 0; i < myIterateUris.length; i++) {
				if (i == myIterateUris.length - 1) {
					myIterateS = myIterateS + '<li class="last"><a href="'
							+ fu(NameAndUrl[i]) + '" target="_blank">'
							+ fn(NameAndUrl[i]) + '</a></li>'
				} else {
					myIterateS = myIterateS + '<li><a href="'
							+ fu(NameAndUrl[i]) + '" target="_blank">'
							+ fn(NameAndUrl[i]) + '</a></li>'
				}
			}
			// end of adding bookmarks of 'myIterateTagarray[n]'

			myIterateS = myIterateS + '</ul></li>'
		}
	}
	return myIterateS
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