var myBookmark = {
	// 预定义变量
	Cc: Components.classes,
	Ci: Components.interfaces,
	htService: this.Cc["@mozilla.org/browser/nav-history-service;1"]
		.getService(this.Ci.nsINavHistoryService),
	bksort_Title: this.Ci.nsINavHistoryQueryOptions.SORT_BY_TITLE_ASCENDING,
	bktype_Uri: this.Ci.nsINavHistoryResultNode.RESULT_TYPE_URI,
	bktype_Folder: this.Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER,

	bkService: this.Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
		.getService(this.Ci.nsINavBookmarksService),

	localFile: this.Cc["@mozilla.org/file/local;1"]
		.createInstance(this.Ci.nsILocalFile),
	filetype_Normal: this.Ci.nsIFile.NORMAL_FILE_TYPE,

	outputStream: this.Cc["@mozilla.org/network/file-output-stream;1"]
		.createInstance(this.Ci.nsIFileOutputStream),
	unicodeConverter: this.Cc["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(this.Ci.nsIScriptableUnicodeConverter),

	// 替换原菜单
	initialize: function() {
		var bmp = document.getElementById('BMB_bookmarksPopup');
		while (bmp.hasChildNodes()) {
			bmp.removeChild(bmp.firstChild);
		}
		bmp.removeAttribute('onpopupshowing');
		// bmp.setAttribute('onpopupshowing','BookmarkingUI.attachPlacesView2(event,
		// this);');
		bmp.addEventListener('popupshowing', function(event) {
			BookmarkingUI.attachPlacesView2(event, this);
		});
		var showallmenu = document.createElement('menuitem');
		showallmenu.setAttribute('id', 'BMB_bookmarksShowAll');
		showallmenu.setAttribute('class', 'subviewbutton panel-subview-footer');
		showallmenu.setAttribute('label', 'Show All Bookmarks');
		showallmenu.setAttribute('command', 'Browser:ShowAllBookmarks');
		showallmenu.setAttribute('key', 'manBookmarkKb');
		bmp.appendChild(showallmenu);
		console.log('it is ok.');
	},

	// 获取所有书签
	getAllBookmarks: function(aFolder) {
		var rBookmarks = new Array();
		var bkURIs = new Array();
		var bkFolders = new Array();
		var query = this.htService.getNewQuery();
		query.setFolders([aFolder], 1);
		var htOptions = this.htService.getNewQueryOptions();
		htOptions.sortingMode = this.bksort_Title // 按名称升序排列
		var result = this.htService.executeQuery(query, htOptions);
		var folderNode = result.root;

		// Open the folder, and iterate over its contents.
		folderNode.containerOpen = true;
		for (var i = 0; i < folderNode.childCount; i++) {
			if (folderNode.getChild(i).type == this.bktype_Uri) {
				var bkURI = {};
				bkURI.name = folderNode.getChild(i).title;
				bkURI.url = folderNode.getChild(i).uri;
				bkURIs.push(bkURI);
			} else if (folderNode.getChild(i).type == this.bktype_Folder) {
				var bkFolder = {};
				bkFolder.name = folderNode.getChild(i).title;
				bkFolder.children = arguments
					.callee(folderNode.getChild(i).itemId);
				bkFolders.push(bkFolder);
			}
		}
		rBookmarks = bkFolders.concat(bkURIs);
		folderNode.containerOpen = false;
		return rBookmarks;
	},

	// 写入文件
	SaveToFile: function(path, content) {
		this.localFile.initWithPath(path);
		if (this.localFile.exists() == false) {
			this.localFile.create(filetype_Normal, 420);
		}
		this.outputStream.init(this.localFile, 0x04 | 0x08 | 0x20, 420, 0);
		this.unicodeConverter.charset = 'UTF-8';
		var convSource = this.unicodeConverter.ConvertFromUnicode(content);
		var result = this.outputStream.write(convSource, convSource.length);
		this.outputStream.close();
	},

	// 转换书签到json数据
	cvBookmarkToJson: function() {
		var s = 'var setting = {}; var zNodes ='
		s = s + JSON.stringify(this
			.getAllBookmarks(this.bkService.bookmarksMenuFolder));
		this.SaveToFile(
			"C:\\Inetpub\\wwwroot\\zTree\\myBookmarks\\bookmarks.js", s);
		alert('Converting bookmarks to Json data has done!');
	}
};

BookmarkingUI.attachPlacesView2 = function(event, node) {
	// If the view is already there, bail out early.
	if (node.parentNode._placesView)
		return;

	new PlacesMenu(event, "place:folder=UNFILED_BOOKMARKS&sort=12", {
		extraClasses: {
			entry: "subviewbutton",
			footer: "panel-subview-footer"
		},
		insertionPoint: ".panel-subview-footer"
	});
};

(function() {
	window.addEventListener("load", myBookmark.initialize, false);
})();