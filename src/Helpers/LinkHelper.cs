using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web;
using Umbraco.Core.Models;

namespace Neurorehab.Umbraco.Helpers
{
	public class LinkHelper
	{
        public static UmbracoHelper umbHelper = new UmbracoHelper(UmbracoContext.Current);

        public static string GetLinkUrl (IPublishedContent linkInfo)
        {
            string url = "";

            if (linkInfo.HasValue("internalLink"))
            {
                var contentNode = linkInfo.GetPropertyValue<IPublishedContent>("internalLink");
                if (contentNode != null)
                {
                    url = contentNode.Url;
                }
            }
            else if (linkInfo.HasValue("externalLink"))
            {
                url = linkInfo.GetPropertyValue<string>("externalLink");
            }
            else if (linkInfo.HasValue("file"))
            {
                var mediaNode = linkInfo.GetPropertyValue<IPublishedContent>("file");
                if (mediaNode != null)
                {
                    url = mediaNode.Url;
                }
            }

            return url;
        }

        public static string GetLinkTarget (IPublishedContent linkInfo)
        {
            string target = "";

            if (linkInfo.HasValue("externalLink") && !linkInfo.HasValue("internalLink"))
            {
                target = "_blank";
            }

            return target;
        }

        public static bool IsAbsoluteUrl(string url)
        {
            Uri result;
            return Uri.TryCreate(url, UriKind.Absolute, out result);
        }
    }
}