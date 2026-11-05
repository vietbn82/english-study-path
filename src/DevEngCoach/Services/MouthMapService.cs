using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IMouthMapService
{
    IReadOnlyList<MouthMapEntry> GetAllEntries();
    MouthMapEntry? GetEntry(string phoneme);
}

public sealed class MouthMapService : IMouthMapService
{
    private static readonly Dictionary<string, MouthMapEntry> Registry = new(StringComparer.OrdinalIgnoreCase)
    {
        ["/t/"] = new(
            Phoneme: "/t/",
            SoundName: "Voiceless Alveolar Stop (Âm đuôi /t/)",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Ngậm miệng lại (unreleased coda). Đầu lưỡi chạm ngạc nhưng chặn đứng luồng khí, không nhả hơi ra.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Đầu lưỡi dán chặt gờ lợi sau răng trên, nén áp suất khí rồi giật lưỡi dứt khoát giải phóng tiếng bật hơi sắc nét.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: Đọc 'commit' thành 'côm-mít' ngậm miệng, nuốt mất âm /t/ khiến người nghe tưởng bạn nói chưa xong.",
            KinestheticFixInstruction: "Nén khí -> Giật đầu lưỡi -> Bật gió nổ (Pop).",
            DevExampleWords: ["commit", "test", "request", "format", "endpoint"],
            MovementDirection: "downward-release"
        ),
        ["/d/"] = new(
            Phoneme: "/d/",
            SoundName: "Voiced Alveolar Stop (Âm đuôi /d/)",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Biến thành âm 'đờ' chèn thêm nguyên âm hoặc ngậm miệng nuốt mất âm.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Đầu lưỡi chặn gờ lợi tương tự /t/, nhưng thanh quản rung mạnh tạo âm trầm vang trước khi nhả dứt khoát.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'build' đọc thành 'biu', 'thread' đọc thành 'thrét'.",
            KinestheticFixInstruction: "Chạm đầu lưỡi gờ lợi -> Rung dây thanh quản -> Nhả nhẹ không thêm ơ.",
            DevExampleWords: ["build", "thread", "load", "payload", "distributed"],
            MovementDirection: "voiced-tap"
        ),
        ["/θ/"] = new(
            Phoneme: "/θ/",
            SoundName: "Voiceless Dental Fricative (Âm TH không rung)",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Đầu lưỡi rụt sâu trong miệng, phát âm giống âm 'th' tiếng Việt hoặc biến thành /t/.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Đưa đầu lưỡi ra giữa 2 hàm răng 2-3mm, kẹp nhẹ bằng răng cửa, đẩy hơi rít liên tục qua khe răng-lưỡi (KHÔNG rung cổ).",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'auth' đọc thành 'ót', 'method' đọc thành 'me-tốt', 'think' đọc thành 'tinh'.",
            KinestheticFixInstruction: "Thè lưỡi giữa 2 răng -> Cắn nhẹ -> Xì hơi mát ra lòng bàn tay.",
            DevExampleWords: ["auth", "method", "thread", "throughput", "algorithm"],
            MovementDirection: "protrude-tongue"
        ),
        ["/ð/"] = new(
            Phoneme: "/ð/",
            SoundName: "Voiced Dental Fricative (Âm TH rung)",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Biến thành âm 'd' hoặc 'z' tiếng Việt mà không thè đầu lưỡi ra ngoài.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Vị trí đặt lưỡi giữa răng y hệt /θ/, nhưng dây thanh quản rung mạnh như tiếng ong kêu.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'this', 'that', 'with' đọc thành 'dít', 'dát', 'uýt'.",
            KinestheticFixInstruction: "Đầu lưỡi giữa răng -> Rung tê đầu lưỡi.",
            DevExampleWords: ["this", "that", "with", "other", "whether"],
            MovementDirection: "protrude-vibrate"
        ),
        ["/s/"] = new(
            Phoneme: "/s/",
            SoundName: "Voiceless Alveolar Fricative",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Nuốt âm 'xì' ở đuôi hoặc thêm bừa bãi vào mọi từ.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Mép môi bè nhẹ như cười, đầu lưỡi sát gờ lợi, luồng hơi rít sắc bén qua khe hẹp.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'response' đọc thành 'rì-pón', 'status' đọc thành 'tát-tút'.",
            KinestheticFixInstruction: "Cười bè mép -> Ép hơi rít sắc qua khe răng.",
            DevExampleWords: ["response", "status", "syntax", "database", "service"],
            MovementDirection: "smile-hiss"
        ),
        ["/z/"] = new(
            Phoneme: "/z/",
            SoundName: "Voiced Alveolar Fricative",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Đọc thành /s/ không rung.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Khẩu hình giống hệt /s/ nhưng đặt ngón tay lên cổ họng thấy rung mạnh.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'keys' đọc thành 'kí-s', 'nodes' đọc thành 'nốt-s'.",
            KinestheticFixInstruction: "Cười bè -> Rung họng dữ dội như còi ong.",
            DevExampleWords: ["keys", "nodes", "runs", "users", "optimizes"],
            MovementDirection: "smile-buzz"
        ),
        ["/ʃ/"] = new(
            Phoneme: "/ʃ/",
            SoundName: "Voiceless Postalveolar Fricative",
            VietnameseHabitTitle: "🇻🇳 Thói quen người Việt",
            VietnameseHabitDescription: "Miệng bẹt như đọc chữ 's' thông thường.",
            EnglishTargetTitle: "🇬🇧 Mục tiêu tiếng Anh",
            EnglishTargetDescription: "Môi chu tròn hẳn về phía trước như huýt sáo, thân lưỡi nâng áp vào vòm họng đẩy hơi xì dày.",
            CommonMistakeAlertVi: "⚠️ Lỗi phổ biến: 'push' đọc thành 'pút' hoặc 'pút-s' bẹt môi.",
            KinestheticFixInstruction: "Chu mỏ tròn -> Thân lưỡi vồng -> Xì tiếng gió dày.",
            DevExampleWords: ["push", "crash", "initialization", "publish", "cache"],
            MovementDirection: "round-lips-forward"
        )
    };

    public IReadOnlyList<MouthMapEntry> GetAllEntries() => Registry.Values.ToList();

    public MouthMapEntry? GetEntry(string phoneme)
    {
        if (string.IsNullOrWhiteSpace(phoneme)) return null;
        var clean = phoneme.Trim();
        if (Registry.TryGetValue(clean, out var entry)) return entry;
        return Registry.Values.FirstOrDefault(e => clean.Contains(e.Phoneme, StringComparison.OrdinalIgnoreCase))
            ?? Registry["/t/"];
    }
}
