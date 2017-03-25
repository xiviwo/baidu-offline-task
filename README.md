Baidu Offline Task Automation
=======

This little script enable you to add baidu offline task easily, thanks to [PhantomJS](http://phantomjs.org/) and [Horseman](https://github.com/johntitus/node-horseman).

##Usage

Support Http/ed2k/ftp/magnet link.

```bash
node index.js -l 'ed2k://|file|Beauty.and.the.Beast.1991.%E7%BE%8E%E5%A5%B3%E4%B8%8E%E9%87%8E%E5%85%BD.%E5%8F%8C%E8%AF%AD%E5%AD%97%E5%B9%95.%E5%9B%BD%E7%B2%A4%E8%8B%B1%E4%B8%89%E9%9F%B3%E8%BD%A8.HR-HDTV.AC3.1024X576.x264.mkv|2032976058|9089ef75a17cca0f26a7fd62964c303a|h=zk5ncs4pejdysshgtahqwyraz5fkq6uj|/'

node index.js -l 'magnet:?xt=urn:btih:F940B7E64494D3B885FEE7D36E8A898D2881EC31'

node index.js -l 'http://ftp.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-7.5p1.tar.gz'

node index.js -l 'ftp://openssl.org/source/openssl-1.0.2k.tar.gz'

```

Or, you can supply multiple same/different type of link at the same time,eg:

```bash
node index.js -l 'magnet:?xt=urn:btih:F940B7E64494D3B885FEE7D36E8A898D2881EC31' -l 'ftp://openssl.org/source/openssl-1.0.2k.tar.gz'
```

##What is Baidu Offline Task
Baidu Cloud Disk is some thing similar to Dropbox, but come with additive wonderful feature: supply any ed2k/magnet/http link, and if that file exsits in the baidu cloud disk, it will be instantly available for you to download or view online(movie/images/pdf/excel files). But, you need to manually supply the link to the baidu cloud disk web UI, it would be no problem, if you only have a few links to supply, it becomes really annoying if you have dozens of them. So, the purpuse of this tool is to provide automative way for you to add as many links as you want.

###Offline Task Screenshot

<img src="beforeadd.png" alt="" width="" height="">

##Example Run

```bash
node index.js -l magnet:?xt=urn:btih:F940B7E64494D3B885FEE7D36E8A898D2881EC31

百度网盘-全部文件
成功打开主页
-----------------------------New Task:---------------------------------------
点击:
离线下载
点击:
新建链接任务
填写要下载的文件链接
magnet:?xt=urn:btih:F940B7E64494D3B885FEE7D36E8A898D2881EC31
点击:
确定
正在检测链接…
正在检测链接…
添加磁力任务
Waiting...
点击:
开始下载
点击:
确定
正在添加任务，请稍候…
正在添加任务，请稍候…
任务添加成功
All Tasks are done
```

##DEBUG
if come into problem, add debug flag before command:
```bash
DEBUG=horseman,horseman:v,task node index.js -l '.......'
```