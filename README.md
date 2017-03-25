Baidu Offline Task Automation
=======

This little script enable you to add baidu offline task easily, thanks to [PhantomJS](http://phantomjs.org/) and [Horseman](https://github.com/johntitus/node-horseman).

## Usage

Support Http/ed2k/ftp/magnet link.

```bash
node index.js -l 'ed2k://|file|..........|/'

node index.js -l 'magnet:?xt=urn:btih:F940B7E64494DFEE6E8A898D2881EC31'

node index.js -l 'http://ftp.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-7.5p1.tar.gz'

node index.js -l 'ftp://openssl.org/source/openssl-1.0.2k.tar.gz'

```

Or, you can supply multiple same/different type of link at the same time,eg:

```bash
node index.js -l 'magnet:?xt=urn:btih:F940B7E64494D3B7D36EA898D2881EC31' -l 'ftp://openssl.org/source/openssl-1.0.2k.tar.gz'
```

##What is Baidu Offline Task
Baidu Cloud Disk is some thing similar to Dropbox, but come with additive wonderful feature: supply any ed2k/magnet/http link, and if that file exsits in the baidu cloud disk, it will be instantly available for you to download or view online(movie/images/pdf/excel files). But, you need to manually supply the link to the baidu cloud disk web UI, it would be no problem, if you only have a few links to supply, it becomes really annoying if you have dozens of them. So, the purpuse of this tool is to provide automative way for you to add as many links as you want.

### Offline Task Screenshot

<img src="beforeadd.png" alt="" width="" height="">

## Example Run

```bash
node index.js -l magnet:?xt=urn:btih:F940B7E64494A898D2881EC31

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

## DEBUG

if come into problem, add debug flag before command:

```bash
DEBUG=horseman,horseman:v,task node index.js -l '.......'
```