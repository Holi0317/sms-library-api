'use strict';

module.exports = {
  info: `<!-- View: info -->

  <html><head><meta http-equiv="Content-Type" content="text/html; charset=Big5"><LINK REL="stylesheet" HREF="../admin/0001.css" TYPE="text/css"><title>CCNet Library - 讀者</title></head>
  <body bgcolor="#ffffff" text="#000000" alink=#000000 link=#000000 vlink=#000000 marginwidth="0" marginheight="0">
  <!---table1----->
  <table border="0" width="98%" cellspacing="0" cellpadding="3" CLASS="thstyle">
    <tr>
      <td width="3" align="left" valign="top">&nbsp;</td>
      <td align="left" valign="top" width="778" colspan="2"><font face="Verdana, Arial, Helvetica, sans-serif" >
      讀者
      </font></td>
    </tr>
  </table>
  <!---end table1----->
  <FORM NAME=PATRONF>
  <table border="0" width="98%" CLASS="tbstyle" cellspacing="1" cellpadding="3" cols=6>
    <TR>
    <TD align="left" valign="top" CLASS="cbstyle" ><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Patron Code</font></TD>
    <TD colspan=5 ><font face="Verdana, Arial, Helvetica, sans-serif" size="2">
    0001
    </tr>
    <!--<tr>
      <td colspan=6 >&nbsp;</td>
    </tr>-->
  </table>

  <P>
  <table border="0" width="98%" CLASS="tbstyle" cellspacing="0" cellpadding="3">
    <tr>
      <td align="left" valign="top" CLASS="chstyle" colspan="2">
        <font face="Verdana, Arial, Helvetica, sans-serif" size="2">
        Message
        </font>
      </td>
    </tr>
    <tr>
      <td width="40" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">
      <br>
      <TEXTAREA NAME=MESG ROWS=10 COLS=55></TEXTAREA>
      <br><br>
      </font></td>
      <td align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">
      <br>
      <img src="arrow_grey.gif" border = 0>
      <a href='chist.asp?PCode=0001'>View Circulation History</a><br><br>
      <img src="arrow_grey.gif" border = 0>
      <a href='finepatron.asp?PCode=0001'>View Fine History</a><br><br>
      <img src="arrow_grey.gif" border = 0>
      <a href='showRes.asp?PCode=0001'>View Reserved Book</a><br><br>
      <img src="arrow_grey.gif" border = 0>
      <a href='showRenew.asp?PCode=0001'>Renew Book</a>
      </td>
    </tr>
  </table>
  <P>
  <table border="0" width="98%" CLASS="tbstyle" cellspacing="1" cellpadding="3">
    <tr>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Login Name</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Chinese Name</font></TD>
    <TD>###</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Sex</font></TD>
    <!-- <TD><INPUT TYPE=TEXT NAME=Sex maxlength=1></TD> -->
    <td>
     #####
    </td>
    </TR>

    <TR>
    <td align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Student No.</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Surname</font></TD>
    <TD>###</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Birthday (YYYYMMDD)</font></TD>
    <td>

    </td>
    </TR>

    <TR>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Class</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Other Name</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">House</font></TD>
    <TD>#####</TD>
    </TR>

    <TR>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Class No.</font></TD>
    <TD>#####</TD>

    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Alias</font></TD>
    <TD></TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Language</font></TD>
    <!-- <TD><INPUT TYPE=radio NAME=Language value=c>中文<INPUT TYPE=radio NAME=Language value=e>English</TD> -->
    <td>
    English
    </td>
    </tr>
    <tr>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Type</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Display Row</font></TD>
    <TD>#####</TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Barcode</font></TD>
    <TD>#####</TD>
    </TR>

  <!--  <tr>
    <td colspan=6>&nbsp;</td>
    </tr>-->

    <tr>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Mobile</font></TD>
    <TD></TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Pager</font></TD>
    <TD></TD>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Password</font></TD>
    <TD>
    #####
    </TD>
    </tr>

    <tr>
    <TD align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">Expiry Date (YYYYMMDD)</font></TD>
    <td colspan=5>#####&nbsp;-&nbsp;#&nbsp;-&nbsp;#</td>
    </tr>

  </table>

  <P>
  <table border="0" width="98%" CLASS="tbstyle" cellspacing="1" cellpadding="3">
    <tr>
      <td align="left" valign="top" CLASS="chstyle" colspan="2">
        <font face="Verdana, Arial, Helvetica, sans-serif" size="1">
        Home
        </font>
        </td>
      <td align="left" valign="top" height="11" CLASS="chstyle" colspan="2">
        <font face="Verdana, Arial, Helvetica, sans-serif" size="1">
        Office
        </font>
        </td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Address
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Address
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Tel
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Tel
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Fax
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Fax
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
    </tr>

    <tr>
      <td width="62" align="left" valign="top" CLASS="cbstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      Email
      </font></td>
      <td width="285" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">

      </font></td>
      <td width="62" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
      <td width="293" align="left" valign="top"><font face="Verdana, Arial, Helvetica, sans-serif" size="1">
      &nbsp;
      </font></td>
    </tr>
  </table>
  </FORM>
  <SCRIPT language=Javascript>this.document.PATRONF.MESG.value='';
  </SCRIPT></BODY>
  </HTML>
`,
  showRenewNoBook: `<!-- Show renew (http://www.library.ccnet-hk.com/central/sms/schlib/patron/showRenew.asp) view with no borrowed book -->

  <html><head><meta http-equiv="Content-Type" content="text/html; charset=Big5"><LINK REL="stylesheet" HREF="../admin/0001.css" TYPE="text/css"><title>CCNet Library - 讀者</title></head>
  <body bgcolor="#ffffff" text="#000000" alink=#000000 link=#000000 vlink=#000000 marginwidth="0" marginheight="0">
  <!---table1----->
  <table border="0" width="98%" cellspacing="0" cellpadding="3" CLASS="thstyle">
    <tr>
      <td width="3" align="left" valign="top">&nbsp;</td>
      <td align="left" valign="top" width="778" colspan="2"><font face="Verdana, Arial, Helvetica, sans-serif" >
      讀者
      </font></td>
    </tr>
  </table>
  <!---end table1----->
  <script language=javascript>
  <!--
  function SelectAllMsg(my_form) {
    len = my_form.elements.length;
    var index = 0;
    for( index=0; index<len; index++ ) {
      if((my_form.elements[index].name).indexOf('sel') == 0) {
        my_form.elements[index].checked = true;
      }
    }
  }
  //-->
  </script>
  <H2>No Record Found!<P></H2></BODY>
  </HTML>
`,
  showRenewHaveBook: `<!-- Show renew (http://www.library.ccnet-hk.com/central/sms/schlib/patron/showRenew.asp) view with 2 borrowed book -->

  <html><head><meta http-equiv="Content-Type" content="text/html; charset=Big5"><LINK REL="stylesheet" HREF="../admin/0005.css" TYPE="text/css"><title>CCNet Library - 讀者</title></head>
  <body bgcolor="#ffffff" text="#000000" alink=#000000 link=#000000 vlink=#000000 marginwidth="0" marginheight="0">
  <!---table1----->
  <table border="0" width="98%" cellspacing="0" cellpadding="3" CLASS="thstyle">
    <tr>
      <td width="3" align="left" valign="top">&nbsp;</td>
      <td align="left" valign="top" width="778" colspan="2"><font face="Verdana, Arial, Helvetica, sans-serif" >
      讀者
      </font></td>
    </tr>
  </table>
  <!---end table1----->
  <script language=javascript>
  <!--
  function SelectAllMsg(my_form) {
    len = my_form.elements.length;
    var index = 0;
    for( index=0; index<len; index++ ) {
      if((my_form.elements[index].name).indexOf('sel') == 0) {
        my_form.elements[index].checked = true;
      }
    }
  }
  //-->
  </script>

  <table>
    <tr>
      <td><font face="Verdana, Arial, Helvetica, sans-serif" size="3">續借書本</font></td>
    </tr>
  </table>
  <form action="saveRenew.asp" method="post">
  <input type="hidden" name="PatCode" value="3687">
  <table border="0" width="98%"  CLASS="tbstyle" cellspacing="1" cellpadding="3">
    <tr>
      <td width="5%" align="left" valign="top" CLASS="chstyle">&nbsp;</td>
      <td width="45%" align="left" valign="top" CLASS="chstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">書名 </font></td>
      <td width="20%" align="left" valign="top" CLASS="chstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">借出日期 </font></td>
      <td width="20%" align="left" valign="top" CLASS="chstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">還書日期 </font></td>
      <td width="10%" align="left" valign="top" CLASS="chstyle"><font face="Verdana, Arial, Helvetica, sans-serif" size="2">續借 </font></td>
    </tr>
  <TR><td width='5%' align='left' valign='top'><input type=checkbox name=sel1 value=26968></td>  <td width='45%' align=left valign=top>Everlasting Sorrow /Robert ELEGANT.</td>  <td width='20%' align=left valign=top>2015/12/2</td>  <td width='20%' align=left valign=top>2016/1/26</td>  <td width='10%' align=left valign=top>3</td></TR><TR><td width='5%' align='left' valign='top'><input type=checkbox name=sel2 value=38390></td>  <td width='45%' align=left valign=top>余光中幽默文選 /余光中.</td>  <td width='20%' align=left valign=top>2015/12/15</td>  <td width='20%' align=left valign=top>2016/1/26</td>  <td width='10%' align=left valign=top>2</td></TR></TABLE><P><P>
  <input type="submit" name="subbut" value="續借">
  <input type="reset" name="resetbut" value="清除">
  <input type="button" name="selbut" value="全部選擇" onClick="SelectAllMsg(document.forms[0])">
  </form>
  </BODY>
  </HTML>
`
}
