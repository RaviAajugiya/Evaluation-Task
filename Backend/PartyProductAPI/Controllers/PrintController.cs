using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PartyProductAPI.DTOs;
using System.Threading.Tasks;
using IronPdf;
using PartyProductAPI.Helper;
using Microsoft.AspNetCore.Identity.UI.Services;
using PartyProductAPI.Service;
using System.Diagnostics.Metrics;
using Microsoft.EntityFrameworkCore;
using BitMiracle.LibTiff.Classic;
using System.Drawing.Printing;
using System.Text;


namespace PartyProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrintController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;
        private readonly IEmailService emailService;

        public PrintController(PartyProductApiContext contex, IMapper mapper, IEmailService emailService)
        {
            this.contex = contex;
            this.mapper = mapper;
            this.emailService = emailService;
        }

        [HttpPost("SendMail")]
        public async Task<ActionResult> SendMail([FromBody] emailDTO emailData)
        {
            var invoiceQuery = from invoice in contex.Invoices
                               join party in contex.Parties on invoice.PartyId equals party.PartyId
                               join invoiceItem in contex.InvoiceItems on invoice.Id equals invoiceItem.InvoiceId
                               join product in contex.Products on invoiceItem.ProductId equals product.ProductId
                               where invoiceItem.InvoiceId == emailData.id
                               group new { invoice, party, product, invoiceItem } by invoice.Id into g
                               select new InvoiceDetailsDTO
                               {
                                   Id = g.Key,
                                   PartyId = g.First().invoice.PartyId,
                                   PartyName = g.First().party.PartyName,
                                   Date = g.First().invoice.Date.ToString("dd-MM-yyyy hh:mm:ss tt"),
                                   Products = g.Select(item => new InvoiceProductsDTO
                                   {
                                       ProductId = item.product.ProductId,
                                       ProductName = item.product.ProductName,
                                       Quantity = item.invoiceItem.Quantity,
                                       Rate = item.invoiceItem.Rate,
                                       Total = item.invoiceItem.Quantity * item.invoiceItem.Rate
                                   }).ToList()
                               };

            var invoiceDTO = await invoiceQuery.FirstOrDefaultAsync();

            if (invoiceDTO == null)
            {
                return NotFound();
            }

            var htmlContent = GenerateHtmlInvoice(invoiceDTO);

            var renderer = new ChromePdfRenderer();
            var pdf = renderer.RenderHtmlAsPdf(htmlContent);

            pdf.SaveAs("output.pdf");
            sendEmail(emailData.email);

            return Ok();
        }



        [HttpPost]
        public async Task<IActionResult> PrintHtml([FromBody] printDTO html)
        {
            var renderer = new ChromePdfRenderer();
            var pdf = renderer.RenderHtmlAsPdf(html.htmldata);
            pdf.SaveAs("invoice.pdf");
            return Ok();
        }

        public async void sendEmail(string email)
        {
            Mailrequest mailrequest = new Mailrequest();
            mailrequest.ToEmail = email;
            mailrequest.Subject = "Invoice";
            mailrequest.Body = "Invoice data";
            await emailService.SendEmailAsync(mailrequest);
        }



        private string GenerateHtmlInvoice(InvoiceDetailsDTO invoiceDTO)
        {
            StringBuilder stringBuilder = new StringBuilder();

            stringBuilder.AppendLine("<!DOCTYPE html>");
            stringBuilder.AppendLine("<html lang=\"en\">");
            stringBuilder.AppendLine("<head>");
            stringBuilder.AppendLine("</head>");
            stringBuilder.AppendLine("<body>");

            stringBuilder.AppendLine($"<h2>Invoice {invoiceDTO.Id}</h2>");
            stringBuilder.AppendLine($"<p>Party ID: {invoiceDTO.PartyId}</p>");
            stringBuilder.AppendLine($"<p>Party Name: {invoiceDTO.PartyName}</p>");
            stringBuilder.AppendLine($"<p>Date: {invoiceDTO.Date}</p>");

            stringBuilder.AppendLine("<table>");
            stringBuilder.AppendLine("    <thead>");
            stringBuilder.AppendLine("        <tr>");
            stringBuilder.AppendLine("            <th>Product ID</th>");
            stringBuilder.AppendLine("            <th>Product Name</th>");
            stringBuilder.AppendLine("            <th>Quantity</th>");
            stringBuilder.AppendLine("            <th>Rate</th>");
            stringBuilder.AppendLine("            <th>Total</th>");
            stringBuilder.AppendLine("        </tr>");
            stringBuilder.AppendLine("    </thead>");
            stringBuilder.AppendLine("    <tbody>");

            foreach (var product in invoiceDTO.Products)
            {
                stringBuilder.AppendLine("        <tr>");
                stringBuilder.AppendLine($"            <td>{product.ProductId}</td>");
                stringBuilder.AppendLine($"            <td>{product.ProductName}</td>");
                stringBuilder.AppendLine($"            <td>{product.Quantity}</td>");
                stringBuilder.AppendLine($"            <td>{product.Rate}</td>");
                stringBuilder.AppendLine($"            <td>{product.Total}</td>");
                stringBuilder.AppendLine("        </tr>");
            }

            stringBuilder.AppendLine("    </tbody>");
            stringBuilder.AppendLine("</table>");
            var grandTotal = invoiceDTO.Products.Sum(product => product.Total);
            stringBuilder.AppendLine($"<p>Grand Total: {grandTotal}</p>");
            stringBuilder.AppendLine("</body>");
            stringBuilder.AppendLine("</html>");

            return stringBuilder.ToString();
        }
    }
}



