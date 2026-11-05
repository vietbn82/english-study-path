using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IIpaGlossaryService
{
    IReadOnlyDictionary<string, IpaTooltipData> GetAll();
    IpaTooltipData? Lookup(string symbol);
}

public sealed class IpaGlossaryService : IIpaGlossaryService
{
    private static readonly Dictionary<string, IpaTooltipData> Glossary = new(StringComparer.OrdinalIgnoreCase)
    {
        ["/t/"] = new(
            Symbol: "/t/",
            SoundCategory: "Voiceless Stop",
            VietnameseEquivalent: "Gần giống 'T' tiếng Việt nhưng BẮT BUỘC bật hơi nổ (release)",
            PhysicalCueVi: "Đầu lưỡi dán chặt gờ lợi sau răng trên, nén khí rồi giật lưỡi bật luồng hơi ra.",
            DevExampleWords: ["commit", "test", "request", "format"],
            CommonMistake: "Ngậm miệng lại (unreleased) làm rụng mất âm cuối."
        ),
        ["/d/"] = new(
            Symbol: "/d/",
            SoundCategory: "Voiced Stop",
            VietnameseEquivalent: "Gần giống 'Đ' nhưng rung cổ họng mạnh và nhả nhẹ nhàng",
            PhysicalCueVi: "Chặn gờ lợi như /t/, rung dây thanh âm trước khi thả lưỡi.",
            DevExampleWords: ["build", "thread", "payload", "node"],
            CommonMistake: "Đọc thành /t/ hoặc chèn thêm âm 'đờ'."
        ),
        ["/θ/"] = new(
            Symbol: "/θ/",
            SoundCategory: "Voiceless Dental Fricative",
            VietnameseEquivalent: "KHÔNG có trong tiếng Việt (hoàn toàn khác âm 'th' tiếng Việt)",
            PhysicalCueVi: "Đầu lưỡi thè ra giữa 2 hàm răng 2mm, kẹp nhẹ, đẩy luồng hơi rít qua khe răng.",
            DevExampleWords: ["auth", "method", "thread", "throughput"],
            CommonMistake: "Đọc thành 'th' tiếng Việt (lưỡi thụt vào) hoặc đọc thành 't'."
        ),
        ["/ð/"] = new(
            Symbol: "/ð/",
            SoundCategory: "Voiced Dental Fricative",
            VietnameseEquivalent: "Giống âm /θ/ nhưng cổ họng rung dữ dội",
            PhysicalCueVi: "Đầu lưỡi kẹp giữa 2 hàm răng, rung mạnh dây thanh quản như còi ong.",
            DevExampleWords: ["this", "that", "with", "other"],
            CommonMistake: "Đọc thành 'd' hoặc 'z' bẹt lưỡi."
        ),
        ["/ʃ/"] = new(
            Symbol: "/ʃ/",
            SoundCategory: "Voiceless Postalveolar Fricative",
            VietnameseEquivalent: "Giống 'S' nặng miền Nam nhưng môi chu tròn hơn",
            PhysicalCueVi: "Chu môi tròn về phía trước, hai bên mép thân lưỡi áp chặt răng hàm trên.",
            DevExampleWords: ["push", "crash", "publish", "cache"],
            CommonMistake: "Miệng bẹt như đọc chữ 's' thông thường."
        ),
        ["/tʃ/"] = new(
            Symbol: "/tʃ/",
            SoundCategory: "Voiceless Affricate",
            VietnameseEquivalent: "Tương tự âm 'CH' nhưng bật gió mạnh và chu môi",
            PhysicalCueVi: "Chặn gờ lợi như /t/ rồi xát gió chu môi /ʃ/ dứt khoát.",
            DevExampleWords: ["branch", "check", "batch", "switch"],
            CommonMistake: "Đọc yếu ớt như 'chờ' tiếng Việt không bật gió."
        ),
        ["/dʒ/"] = new(
            Symbol: "/dʒ/",
            SoundCategory: "Voiced Affricate",
            VietnameseEquivalent: "Tương tự âm 'J' tiếng Anh, rung họng và chu môi",
            PhysicalCueVi: "Chặn gờ lợi như /d/ rồi xát rung /ʒ/, chu môi về phía trước.",
            DevExampleWords: ["merge", "edge", "JSON", "bridge"],
            CommonMistake: "Đọc thành 'd' hoặc 'z' không rung."
        ),
        ["/ə/"] = new(
            Symbol: "/ə/",
            SoundCategory: "Schwa (Nguyên âm suy biến)",
            VietnameseEquivalent: "Âm 'ơ' lướt cực ngắn, thư giãn",
            PhysicalCueVi: "Thả lỏng toàn bộ cơ miệng, lưỡi ở vị trí trung tính, phát âm lướt nhẹ.",
            DevExampleWords: ["database", "connection", "asynchronous", "server"],
            CommonMistake: "Đọc rõ từng âm tiết khiến ngữ điệu bị giật cục."
        ),
        ["/iː/"] = new(
            Symbol: "/iː/",
            SoundCategory: "Long Front Vowel",
            VietnameseEquivalent: "Âm 'I' căng mép, kéo dài",
            PhysicalCueVi: "Mép miệng cười bè tối đa sang hai bên, cơ mặt căng, ngân dài gấp đôi.",
            DevExampleWords: ["lead", "leak", "sheet", "read"],
            CommonMistake: "Đọc ngắn như 'i' tiếng Việt dễ nhầm sang từ nhạy cảm."
        ),
        ["/ɪ/"] = new(
            Symbol: "/ɪ/",
            SoundCategory: "Short Front Vowel",
            VietnameseEquivalent: "Âm 'i' thả lỏng, hơi hướng 'ê'",
            PhysicalCueVi: "Hàm thả rơi nhẹ 0.5cm, cơ miệng hoàn toàn chùng, phát âm trầm và ngắn.",
            DevExampleWords: ["commit", "build", "lid", "bit"],
            CommonMistake: "Bè mép cười quá mức làm biến thành âm /iː/ dài."
        )
    };

    public IReadOnlyDictionary<string, IpaTooltipData> GetAll() => Glossary;

    public IpaTooltipData? Lookup(string symbol)
    {
        if (string.IsNullOrWhiteSpace(symbol)) return null;
        var clean = symbol.Trim();
        if (Glossary.TryGetValue(clean, out var entry)) return entry;
        return Glossary.Values.FirstOrDefault(e => clean.Contains(e.Symbol, StringComparison.OrdinalIgnoreCase));
    }
}
