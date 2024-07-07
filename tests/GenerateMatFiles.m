% Run with matlab to generate the required mat files

specials = struct();
specials.floats = [0, nan, inf, -inf, 1]; % special doubles
specials.double_as_int1 = [-1,-2,-3]; % doubles when loaded, saved as int16
specials.double_as_int2 = [0, 1, 2];

saveTest(specials, false);

numericTests = struct();
numericTests.f32 = single(-1234567.890);
numericTests.f32_array = single([-1234567.890, 0, 1234567.890, 1.1755e-38, 3.4028e+38]);
numericTests.f64 = -1234567.890123456789;
numericTests.f64_array = [-1234567.890123456789, 0, 1234567.890123456789, 2.225073858507201e-308, 1.797693134862316e+308];
numericTests.i8 = int8(-8);
numericTests.i8_array = int8([-128, 0, 127]);
numericTests.ui8 = uint8(8);
numericTests.ui8_array = uint8([0, 128, 255]);
numericTests.i16 = int16(-1616);
numericTests.i16_array = int16([-32768, 0, 32767]);
numericTests.ui16 = uint16(1616);
numericTests.ui16_array = uint16([0, 32768, 65535]);
numericTests.i32 = int32(-32323232);
numericTests.i32_array = int32([-2147483648, 0, 2147483647]);
numericTests.ui32 = uint32(32323232);
numericTests.ui32_array = uint32([0, 2147483648, 4294967295]);
numericTests.i64 = int64(-646464646464646464);
numericTests.i64_array = int64([-9223372036854775808, 0, 9223372036854775807]);
numericTests.ui64 = uint64(646464646464646464);
numericTests.ui64_array = uint64([0, 9223372036854775808, 18446744073709551615]);
saveTest(numericTests, false);

charTests = struct();
charTests.c_1 = 'A'; % short char array
charTests.c_42 = 'A longer string with some additional text!';
charTests.c_1000 = 'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2B';
charTests.c_array = {'A','B','C','D','A longer string with some additional text!'};
saveTest(charTests, false);
saveTest(charTests, true);

structTests = struct();
s1 = struct();
s1.numeric = numericTests;
s1.chars = charTests;
structTests.nested = struct();
s1.name = 'Nested1';
structTests.nested.s1 = s1;
structTests.s.name = 'Nested2';
structTests.nested.s2 = s1;
saveTest(structTests, false);

cellTests = struct();
cellTests.cell1 = {'A', 1, 0};
cellTests.cell2 = {'A', 1, {1,2,3,4,'five'}};
saveTest(cellTests, false);

function saveTest(testStruct, compress)
    if ~exist("matFiles", "dir")
        mkdir("matFiles");
    end

    filename = "matFiles/" + inputname(1);
    fprintf("Saving %s\n", inputname(1));
    names = string(fieldnames(testStruct));
    for name=names'
        % Saving without compression, as it is not supported currently
        S = struct();
        S.(name) = testStruct.(name);
        if (compress)
            save(filename + "_" + name + ".gz.mat", "-struct", "S", "-v7");
        else
            save(filename + "_" + name + ".mat", "-struct", "S", "-v7", "-nocompression");
        end
    end
    
    % Save them all together
    % save(filename + ".mat", "-struct", "testStruct", "-v7", "-nocompression");
end